import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

import { systemPrompt } from '@/ai/prompts/create-resume.system.prompt';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
  }

  async analyzeJobDescription(jobDescription: string): Promise<any> {
    const userPrompt = `Job Description:\n\n${jobDescription}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' } as any,
    } as any);

    const content = response.choices?.[0]?.message?.content;
    try {
      return JSON.parse(content || '{}');
    } catch (e) {
      return { raw: content };
    }
  }
}


