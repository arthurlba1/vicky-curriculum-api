import { Injectable } from '@nestjs/common';

import { GenerateResumeDto } from '@/resume/dto/generate-resume.dto';

@Injectable()
export class ResumeService {

  async generateResume(dto: GenerateResumeDto, writer: NodeJS.WritableStream) {
    const fakeResponse = [
      { section: 'summary', text: 'Experienced developer with 5 years in React and Node.js.' },
      { section: 'skills', text: 'React, Node.js, TypeScript, GraphQL' },
      { section: 'experience', text: 'Worked at X building scalable web apps.' },
    ];

    for (const chunk of fakeResponse) {
      writer.write(JSON.stringify(chunk) + '\n');
      await new Promise((r: any) => setTimeout(r, 800));
    }

    writer.end();
  }
}
