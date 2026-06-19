# Headroom trong MIS SMART Portal

Headroom đã được cài bằng npm package `headroom-ai`.

## Mục đích

Headroom nén context trước khi gửi vào LLM:

- tool outputs
- logs
- DB/query results
- file reads
- RAG chunks
- conversation history

Kết quả kỳ vọng: ít token hơn, vẫn giữ nội dung quan trọng. Với CCR, bản gốc có thể được cache và retrieve lại khi cần.

## Package hiện tại

```bash
npm install headroom-ai
```

Package Node/TypeScript hiện tại expose library/adapters, không expose CLI `bin` trong npm package. Vì vậy repo này **không thêm** script `headroom:proxy` / `headroom:perf` vào `package.json`.

## Dùng trực tiếp trong TypeScript

```ts
import { compress } from 'headroom-ai';

const result = await compress(messages, {
  model: 'gpt-4o',
  baseUrl: process.env.HEADROOM_BASE_URL ?? 'http://localhost:8787',
  fallback: true,
  retries: 1,
});

console.log(result.tokensSaved, result.compressionRatio);
```

> `fallback: true` giúp request vẫn chạy với messages gốc nếu proxy/cloud tạm lỗi.

## HeadroomClient

```ts
import { HeadroomClient } from 'headroom-ai';

export const headroom = new HeadroomClient({
  baseUrl: process.env.HEADROOM_BASE_URL ?? 'http://localhost:8787',
  apiKey: process.env.HEADROOM_API_KEY,
  config: {
    smartCrusher: { enabled: true, maxItemsAfterCrush: 10 },
    ccr: { enabled: true },
  },
});
```

## Env đề xuất

```env
HEADROOM_BASE_URL=http://localhost:8787
# HEADROOM_API_KEY=hr_...
```

- Local proxy: dùng khi có Python/Headroom proxy chạy ngoài app.
- Cloud API key: dùng khi dùng Headroom Cloud.

## Khi nên dùng

Dùng Headroom cho payload dài, lặp, hoặc nhiều noise:

- log build/runtime dài
- kết quả search nhiều dòng
- dữ liệu bảng/JSON lớn
- RAG chunks lớn
- transcript dài

## Khi không nên dùng / cần thận trọng

Không nén mù cho dữ liệu cần nguyên văn tuyệt đối:

- pháp lý/hợp đồng
- token/secret/key material
- payload cần byte-exact
- câu hỏi yêu cầu trích dẫn nguyên văn
- dữ liệu nhỏ dưới vài KB

Trong các trường hợp đó, bỏ qua Headroom hoặc dùng CCR + retrieve bản gốc.

## Tích hợp tương lai

Repo hiện có `@google/genai`, chưa có Vercel AI SDK `ai`. Nếu sau này thêm AI SDK hoặc OpenAI/Anthropic SDK, có thể dùng adapters:

```ts
import { withHeadroom } from 'headroom-ai/openai';
import { withHeadroom as withGeminiHeadroom } from 'headroom-ai/gemini';
import { withHeadroom as withVercelHeadroom } from 'headroom-ai/vercel-ai';
```

Trước khi tích hợp sâu vào route/API production, cần test luồng cụ thể vì compression có thể thay đổi prompt/context được gửi cho model.
