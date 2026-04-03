# 测试指南

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架，配合 [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) 进行组件测试。

## 测试技术栈

- **Vitest** - 快速、轻量的测试框架
- **React Testing Library** - React 组件测试工具
- **JSDOM** - 浏览器环境模拟
- **MSW** - API 模拟（Mock Service Worker）

## 目录结构

```
├── lib/
│   ├── utils.test.ts           # 工具函数测试
│   └── auth-context.test.tsx   # 认证上下文测试
├── components/
│   └── nav-user.test.tsx       # 组件测试
├── app/
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.test.ts    # API 路由测试
│           └── register/
│               └── route.test.ts    # API 路由测试
├── test/
│   └── setup.ts                # 测试环境配置
└── vitest.config.ts            # Vitest 配置
```

## 运行测试

```bash
# 运行所有测试
bun test

# 运行测试并监视文件变化
bun test --watch

# 运行测试并生成覆盖率报告
bun test:coverage

# 打开 Vitest UI 界面
bun test:ui

# 运行特定测试文件
bun test lib/utils.test.ts
```

## 编写测试

### 工具函数测试

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

### 组件测试

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavUser } from './nav-user'

describe('NavUser', () => {
  it('should render user information', () => {
    const user = { name: 'Test', email: 'test@example.com', avatar: '' }
    render(<NavUser user={user} />)
    
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### API 路由测试

```typescript
import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

describe('POST /api/auth/login', () => {
  it('should return 401 for invalid credentials', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

## Mock 配置

测试环境已配置以下 Mock：

- **Next.js Router** - `useRouter`, `usePathname`, `useSearchParams`
- **localStorage** - 浏览器本地存储
- **matchMedia** - CSS 媒体查询
- **IntersectionObserver** - 元素可见性观察
- **ResizeObserver** - 元素大小变化观察

## 最佳实践

1. **测试命名** - 使用描述性的测试名称，说明测试的行为
2. **独立性** - 每个测试应该独立运行，不依赖其他测试
3. **清理** - 使用 `beforeEach` 清理 mock 和状态
4. **用户视角** - 优先使用 `getByRole`, `getByText` 等用户可见的查询
5. **覆盖率** - 保持核心功能的测试覆盖率在 80% 以上

## 持续集成

在 CI/CD 流程中运行测试：

```bash
bun install
bun test --run
bun test:coverage
```

## 常见问题

### 测试找不到模块

确保在 `vitest.config.ts` 中正确配置了路径别名：

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

### 组件渲染失败

检查是否在 `test/setup.ts` 中添加了必要的 Mock。

### 异步测试超时

使用 `waitFor` 处理异步操作：

```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```
