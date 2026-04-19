from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = os.getenv('PORT', 3001)

# 智谱API配置
ZHIPU_API_KEY = os.getenv('ZHIPU_API_KEY')
ZHIPU_API_URL = 'https://open.bigmodel.cn/api/mock/chat/completions'

# 健康检查
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

# AI卦象解释API - SSE版本
@app.route('/api/ai-interpret', methods=['POST'])
def ai_interpret():
    def generate():
        try:
            data = request.json
            question = data.get('question')
            hexagram_result = data.get('hexagramResult')
            
            if not question or not hexagram_result:
                yield f"data: {json.dumps({'success': False, 'error': 'Missing required parameters'}, ensure_ascii=False)}\n\n"
                return

            # 构建智谱API请求 - 启用流式响应
            request_data = {
                "model": "glm-4-flash",
                "messages": [
                    {
                        "role": "system",
                        "content": "你是一个专业的易经占卜解释师，精通易经卦象分析。请根据用户提供的占卜结果，给出详细、专业的解释。解释应包括：1. 卦象的基本含义 2. 针对用户问题的具体分析 3. 给出合理的建议。请使用中文回答，语言要专业但易懂。"
                    },
                    {
                        "role": "user",
                        "content": f"用户问题：{question}\n\n占卜结果：{hexagram_result}"
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000,
                "stream": True
            }

            # 调用智谱API
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ZHIPU_API_KEY}"
            }
            
            # 使用流式请求
            with requests.post(ZHIPU_API_URL, json=request_data, headers=headers, stream=True) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line:
                        # 处理SSE格式的数据
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]
                            if data_str != '[DONE]':
                                try:
                                    sse_data = json.loads(data_str)
                                    # 提取并转发文本内容
                                    if 'choices' in sse_data and len(sse_data['choices']) > 0:
                                        delta = sse_data['choices'][0].get('delta', {})
                                        content = delta.get('content', '')
                                        if content:
                                            yield f"data: {json.dumps({'success': True, 'content': content}, ensure_ascii=False)}\n\n"
                                except json.JSONDecodeError:
                                    continue
                # 发送完成信号
                yield f"data: {json.dumps({'success': True, 'done': True}, ensure_ascii=False)}\n\n"
                
        except Exception as error:
            print(f"Error calling Zhipu API: {error}")
            yield f"data: {json.dumps({'success': False, 'error': 'Failed to get AI interpretation'}, ensure_ascii=False)}\n\n"

    # 设置SSE响应头
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
    app.run(port=PORT, debug=True)
