import { GoogleGenAI, Type } from "@google/genai";
import { ListingInputData, AnalysisResults } from "../types";

// 声明全局变量以解决 TS2580 编译错误，环境变量会在运行时注入
declare var process: {
  env: {
    API_KEY: string;
  };
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeAndGenerate(data: ListingInputData): Promise<AnalysisResults> {
    const textContext = `
      你是一名拥有10年经验的亚马逊高级运营专家，精通关键词数据挖掘、词根拆解（Root Decomposition）、高频词分析以及消费者声音（VOC）分析。
      
      【输入数据】
      1. ABA 搜索词报告: ${data.abaFileContent || "未提供"}
      2. 竞对文案内容: ${data.competitors.map((c, i) => `[竞对${i+1}]: ${c.bullets}`).join('\n')}
      3. 竞对 Review/VOC 数据: ${data.reviewFileContent}
      4. 我们的产品基本情况: ${data.productName} - ${data.productDesc}

      【分析步骤】
      1. **ABA词库分析**：执行词根拆解(Root Decomposition)，统计高频词。筛选出最贴合我司产品的核心关键词。
      2. **竞对解构**：分析竞对的文案风格、核心关键词埋点策略以及核心卖点。
      3. **VOC痛点探测**：从评论数据中提炼客户真实需求点（痛点）及竞对产品的通病（缺点），并以此作为我司文案的突破口（降维打击）。

      【文案输出要求】
      请输出两套完整的 Listing（Title, 5 Bullet Points, Product Description）：
      - **Version 1 (SEO & Keyword Optimization)**: 侧重于词根覆盖和权重提升，确保核心词位置优越。
      - **Version 2 (Conversion & VOC Focused)**: 侧重于直击消费者痛点，通过对比（暗示）解决竞对缺点来提升转化率。
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: textContext }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywordAnalysis: {
              type: Type.OBJECT,
              properties: {
                roots: { type: Type.ARRAY, items: { type: Type.STRING }, description: "拆解后的核心词根列表" },
                highFreq: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      word: { type: Type.STRING }, 
                      count: { type: Type.NUMBER } 
                    } 
                  },
                  description: "高频词统计"
                },
                coreKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "建议埋入文案的核心关键词" },
              },
              required: ["roots", "highFreq", "coreKeywords"]
            },
            competitorInsights: {
              type: Type.OBJECT,
              properties: {
                writingStyles: { type: Type.STRING },
                coreKeywordUsage: { type: Type.STRING },
                sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["writingStyles", "coreKeywordUsage", "sellingPoints"]
            },
            reviewInsights: {
              type: Type.OBJECT,
              properties: {
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "消费者主要痛点" },
                defects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "竞对产品常见缺点（标注）" },
              },
              required: ["painPoints", "defects"]
            },
            listings: {
              type: Type.OBJECT,
              properties: {
                version1: {
                  type: Type.OBJECT,
                  properties: { 
                    title: { type: Type.STRING }, 
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                    description: { type: Type.STRING } 
                  },
                  required: ["title", "bullets", "description"]
                },
                version2: {
                  type: Type.OBJECT,
                  properties: { 
                    title: { type: Type.STRING }, 
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                    description: { type: Type.STRING } 
                  },
                  required: ["title", "bullets", "description"]
                }
              },
              required: ["version1", "version2"]
            }
          },
          required: ["keywordAnalysis", "competitorInsights", "reviewInsights", "listings"]
        }
      }
    });

    try {
      const resultText = response.text || '{}';
      return JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", e);
      throw new Error("AI 返回数据格式错误，请稍后重试。");
    }
  }
}