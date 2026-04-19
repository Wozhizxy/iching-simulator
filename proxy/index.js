const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 智谱API配置
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/mock/chat/completions';

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI卦象解释API
app.post('/api/ai-interpret', async (req, res) => {
  try {
    const { question, hexagramResult } = req.body;
    
    if (!question || !hexagramResult) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 构建智谱API请求
    const requestData = {
      model: 'glm-4-flash',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的易经占卜解释师，精通易经卦象分析。请根据用户提供的占卜结果，给出详细、专业的解释。解释应包括：1. 卦象的基本含义 2. 针对用户问题的具体分析 3. 给出合理的建议。请使用中文回答，语言要专业但易懂。'
        },
        {
          role: 'user',
          content: `用户问题：${question}\n\n占卜结果：${JSON.stringify(hexagramResult, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    // 调用智谱API
    const response = await axios.post(ZHIPU_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`
      }
    });

    // 返回AI解释结果
    res.json({
      success: true,
      interpretation: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('Error calling Zhipu API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get AI interpretation' 
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});