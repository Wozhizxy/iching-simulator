from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
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

# AI卦象解释API
@app.route('/api/ai-interpret', methods=['POST'])
def ai_interpret():
    try:
        data = request.json
        question = data.get('question')
        hexagram_result = data.get('hexagramResult')
        
        if not question or not hexagram_result:
            return jsonify({"error": "Missing required parameters"}), 400

        # 构建智谱API请求
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
            "max_tokens": 1000
        }

        # 调用智谱API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {ZHIPU_API_KEY}"
        }
        response = requests.post(ZHIPU_API_URL, json=request_data, headers=headers)
        response.raise_for_status()
        response_data = response.json()

        # 返回AI解释结果
        return jsonify({
            "success": True,
            "interpretation": response_data['choices'][0]['message']['content']
        })

    except Exception as error:
        print(f"Error calling Zhipu API: {error}")
        return jsonify({
            "success": False,
            "error": "Failed to get AI interpretation"
        }), 500

if __name__ == '__main__':
    app.run(port=PORT, debug=True)
