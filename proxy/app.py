from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = Flask(__name__)
ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://wozhizxy.github.io',
]
CORS(app, origins=ALLOWED_ORIGINS)

PORT = os.getenv('PORT', 3001)

# 智谱API配置
ZHIPU_API_KEY = os.getenv('ZHIPU_API_KEY')
ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

# 健康检查
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

# AI卦象解释API - SSE版本
@app.route('/api/ai-interpret', methods=['POST'])
def ai_interpret():
    # 在请求上下文中获取数据
    print("Received request for AI interpretation")
    data = request.json
    print(f"Request data: {data}")
    
    question = data.get('question', '请分析此卦象')
    hexagram_context = data.get('hexagramContext', '')

    if not hexagram_context:
        error_msg = "缺少卦象信息（hexagramContext）"
        print(f"Error: {error_msg}")
        return Response(
            f"data: {json.dumps({'success': False, 'error': error_msg}, ensure_ascii=False)}\n\n",
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )

    system_prompt = (
        "你是精通《周易》的占卜师，深研六十四卦、三百八十四爻及《易传》义理。"
        "请根据用户所问之事与铜钱起卦所得卦象，给出专业、深入的分析与指引，结构如下：\n"
        "1. 本卦象征：阐述卦名内涵、上下卦交感之义；\n"
        "2. 动爻与变卦解析（若有）：结合变爻位置与变卦，揭示事态走向；\n"
        "3. 切题指引：紧扣用户所问，给出具体、可行的建议；\n"
        "4. 总论：以一两句话提炼核心启示。\n"
        "语言要典雅而通俗，以中文作答，篇幅适中（400～600字）。"
    )

    user_message = (
        f"所问之事：{question}\n\n"
        f"【铜钱起卦结果】\n{hexagram_context}\n\n"
        "请依据上述卦象，对所问之事作出详解与指引。"
    )

    # 构建智谱API请求 - 启用流式响应
    request_data = {
        "model": "glm-4-flash-250414",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 1200,
        "stream": True
    }

    print(f"Sending request to Zhipu API: {ZHIPU_API_URL}")
    
    # 调用智谱API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ZHIPU_API_KEY}"
    }

    def generate():
        try:
            print(f"Calling Zhipu API: {ZHIPU_API_URL}")
            with requests.post(
                ZHIPU_API_URL,
                headers=headers,
                json=request_data,
                stream=True,
                timeout=60
            ) as resp:
                resp.raise_for_status()
                for raw_line in resp.iter_lines():
                    if not raw_line:
                        continue
                    line = raw_line.decode('utf-8') if isinstance(raw_line, bytes) else raw_line
                    if not line.startswith('data: '):
                        continue
                    payload = line[6:].strip()
                    if payload == '[DONE]':
                        yield f"data: {json.dumps({'success': True, 'done': True}, ensure_ascii=False)}\n\n"
                        break
                    try:
                        chunk = json.loads(payload)
                        delta = chunk['choices'][0]['delta'].get('content', '')
                        if delta:
                            yield f"data: {json.dumps({'success': True, 'content': delta}, ensure_ascii=False)}\n\n"
                        finish_reason = chunk['choices'][0].get('finish_reason')
                        if finish_reason and finish_reason != 'null':
                            yield f"data: {json.dumps({'success': True, 'done': True}, ensure_ascii=False)}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError) as parse_err:
                        print(f"Parse error: {parse_err}, line: {line}")
                        continue
            print("SSE response completed")
        except Exception as error:
            print(f"Error in generate function: {error}")
            yield f"data: {json.dumps({'success': False, 'error': f'AI解析失败：{str(error)}'}, ensure_ascii=False)}\n\n"

    # 设置SSE响应头
    print("Starting SSE response")
    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    )

if __name__ == '__main__':
    is_prod = os.getenv('RENDER') or os.getenv('RAILWAY_ENVIRONMENT')
    app.run(host='0.0.0.0', port=int(PORT), debug=not is_prod)
