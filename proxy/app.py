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
    # 在请求上下文中获取数据
    print("Received request for AI interpretation")
    data = request.json
    print(f"Request data: {data}")
    
    question = data.get('question')
    hexagram_result = data.get('hexagramResult')
    
    if not question or not hexagram_result:
        error_msg = "Missing required parameters"
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

    print(f"Sending request to Zhipu API: {ZHIPU_API_URL}")
    
    # 调用智谱API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ZHIPU_API_KEY}"
    }

    def generate():
        try:
            # 直接返回模拟数据，不调用API
            print("Returning simulated SSE response")
            
            # 模拟流式输出
            simulated_response = "根据您的卦象，我为您提供以下分析：\n\n1. 卦象基本含义：\n本卦为乾为天，象征着刚健、进取、成功。乾卦是易经六十四卦之首，代表着阳性的力量和积极向上的精神。\n\n2. 针对您的问题：\n您所问的问题涉及到事业发展，乾卦显示您正处于一个充满机遇的时期，只要保持积极进取的态度，就能够取得成功。\n\n3. 建议：\n- 保持自信，勇于面对挑战\n- 制定明确的目标和计划\n- 善于把握时机，果断行动\n- 保持谦虚，不断学习和提升自己\n\n祝您事业顺利，心想事成！"
            
            # 逐字发送模拟数据
            for char in simulated_response:
                yield f"data: {json.dumps({'success': True, 'content': char}, ensure_ascii=False)}\n\n"
            
            # 发送完成信号
            yield f"data: {json.dumps({'success': True, 'done': True}, ensure_ascii=False)}\n\n"
            print("SSE response completed")
                
        except Exception as error:
            print(f"Error in generate function: {error}")
            yield f"data: {json.dumps({'success': False, 'error': f'Failed to get AI interpretation: {str(error)}'}, ensure_ascii=False)}\n\n"

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
    app.run(port=PORT, debug=True)
