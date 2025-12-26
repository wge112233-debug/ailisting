import { GoogleGenAI, Type } from "@google/genai";
import { ListingInputData, AnalysisResults } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeAndGenerate(data: ListingInputData): Promise<AnalysisResults> {
    const textContext = `
      你是一名拥有10年经验的专业亚马逊高级运营专家，精通 SEO、数据挖掘和消费者心理学。
      
      【待分析原始数据】
      1. ABA 搜索词报告数据: ${data.abaFileContent || "未提供"}
      2. 竞对链接文案 (标题与五点): ${data.competitors.map((c, i) => `[竞对 ${i+1}]: ${c.bullets}`).join('\n')}
      3. Review/VOC 原始反馈: ${data.reviewFileContent}
      4. 我方产品信息: 品名: ${data.productName}, 描述: ${data.productDesc}

      【分析任务】
      A. ABA 词库深度分析：
         - 执行词根拆解 (Root Decomposition)，找出最核心的功能名词。
         - 进行高频词统计，识别流量支柱。
         - 筛选出高相关性关键词，用于后续 SEO 标题布局。

      B. 竞对策略解构：
         - 分析其文案卖点排列顺序及核心关键词埋词方式。
         - 提取其核心卖点。

      C. VOC 痛点探测（关键）：
         - 找出竞对产品被抱怨最多的“质量缺点”、“设计缺陷”或“体验不足”。
         - 明确标注这些缺点。
         - 在生成的 Listing 文案中，强调我方产品通过何种设计改进了这些竞对缺陷（差异化打击）。

      【输出要求】
      - 必须返回纯 JSON 格式。
      - 输出 2 个版本的 Listing：
        - Version 1 (SEO 导向型)：堆满高权重词根，适合新品冲排名。
        - Version 2 (高转化型)：侧重解决 VOC 痛点，文案极具说服力。
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
                roots: { type: Type.ARRAY, items: { type: Type.STRING } },
                highFreq: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      word: { type: Type.STRING }, 
                      count: { type: Type.NUMBER } 
                    } 
                  } 
                },
                coreKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                defects: { type: Type.ARRAY, items: { type: Type.STRING } },
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

    return JSON.parse(response.text || '{}');
  }
}