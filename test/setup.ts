// Declare vi for TypeScript compiler
declare let vi: any;

// Mock window, document, and localStorage
if (typeof window === 'undefined') {
  // Create a mock function that works in both test and build environments
  const mockFn = (implementation?: any) => {
    return typeof vi !== 'undefined' ? vi.fn(implementation) : function() {}
  }

  global.window = {
    localStorage: {
      getItem: mockFn(),
      setItem: mockFn(),
      removeItem: mockFn(),
      clear: mockFn(),
    },
    sessionStorage: {
      getItem: mockFn(),
      setItem: mockFn(),
      removeItem: mockFn(),
      clear: mockFn(),
    },
    location: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: mockFn(),
      replace: mockFn(),
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  } as Window & typeof globalThis
}

if (typeof document === 'undefined') {
  // Create a symbol for isPrepared
  const isPrepared = Symbol('Node prepared with document state workarounds')
  
  // Create a mock function that works in both test and build environments
  const mockFn = (implementation?: any) => {
    return typeof vi !== 'undefined' ? vi.fn(implementation) : function() {}
  }

  global.document = {
    // Add isPrepared symbol
    [isPrepared]: true,
    
    head: {
      appendChild: mockFn(),
      removeChild: mockFn(),
      getElementsByTagName: mockFn(() => []),
    },
    body: {
      appendChild: mockFn(),
      removeChild: mockFn(),
      querySelector: mockFn(),
      querySelectorAll: mockFn(() => []),
      getElementsByClassName: mockFn(() => []),
      getElementsByTagName: mockFn(() => []),
      style: {},
    },
    createElement: mockFn((tag: string) => {
      const element: any = {
        appendChild: mockFn(),
        removeChild: mockFn(),
        querySelector: mockFn(),
        querySelectorAll: mockFn(() => []),
        getElementsByClassName: mockFn(() => []),
        getElementsByTagName: mockFn(() => []),
        style: {},
        classList: {
          add: mockFn(),
          remove: mockFn(),
          contains: mockFn(() => false),
        },
        setAttribute: mockFn(),
        getAttribute: mockFn(),
        removeAttribute: mockFn(),
        id: '',
        className: '',
        innerHTML: '',
        textContent: '',
        nodeType: 1,
        nodeName: tag.toUpperCase(),
        parentNode: null,
        childNodes: [],
        firstChild: null,
        lastChild: null,
        nextSibling: null,
        previousSibling: null,
        offsetParent: null,
        offsetTop: 0,
        offsetLeft: 0,
        offsetWidth: 0,
        offsetHeight: 0,
        clientTop: 0,
        clientLeft: 0,
        clientWidth: 0,
        clientHeight: 0,
        scrollTop: 0,
        scrollLeft: 0,
        scrollWidth: 0,
        scrollHeight: 0,
        getBoundingClientRect: mockFn(() => ({
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
        })),
        getClientRects: mockFn(() => []),
        focus: mockFn(),
        blur: mockFn(),
        click: mockFn(),
        addEventListener: mockFn(),
        removeEventListener: mockFn(),
        dispatchEvent: mockFn(),
      }
      
      if (tag === 'style') {
        element.type = 'text/css'
        element.innerText = ''
        element.innerHTML = ''
      }
      
      if (tag === 'div') {
        element.appendChild = mockFn((child: any) => {
          element.childNodes.push(child)
          if (element.childNodes.length === 1) {
            element.firstChild = child
            element.lastChild = child
          } else {
            element.lastChild = child
          }
        })
      }
      
      return element
    }),
    getElementById: mockFn(),
    getElementsByClassName: mockFn(() => []),
    getElementsByTagName: mockFn(() => []),
    querySelector: mockFn(),
    querySelectorAll: mockFn(() => []),
    addEventListener: mockFn(),
    removeEventListener: mockFn(),
    dispatchEvent: mockFn(),
    title: 'Test Document',
    createTextNode: mockFn((text: string) => ({
      textContent: text,
      nodeType: 3,
      nodeName: '#text',
      parentNode: null,
    })),
    createComment: mockFn(() => ({
      nodeType: 8,
      nodeName: '#comment',
      parentNode: null,
    })),
    createDocumentFragment: mockFn(() => ({
      appendChild: mockFn(),
      removeChild: mockFn(),
      querySelector: mockFn(),
      querySelectorAll: mockFn(() => []),
      childNodes: [],
      nodeType: 11,
      nodeName: '#document-fragment',
    })),
    importNode: mockFn((node: any) => node),
    adoptNode: mockFn((node: any) => node),
    createEvent: mockFn(() => ({
      initEvent: mockFn(),
      preventDefault: mockFn(),
      stopPropagation: mockFn(),
      bubbles: false,
      cancelable: false,
    })),
    createMouseEvent: mockFn(() => ({
      initMouseEvent: mockFn(),
      preventDefault: mockFn(),
      stopPropagation: mockFn(),
      target: {},
      currentTarget: {},
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
    })),
    createKeyboardEvent: mockFn(() => ({
      initKeyboardEvent: mockFn(),
      preventDefault: mockFn(),
      stopPropagation: mockFn(),
      key: '',
      code: '',
      target: {},
      currentTarget: {},
    })),
  } as unknown as Document
}

// Mock console.error to suppress React warnings in tests
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: ReactDOM.render is deprecated') ||
      args[0].includes('Target container is not a DOM element') ||
      args[0].includes('Cannot read properties of null'))
  ) {
    return
  }
  originalError.call(console, ...args)
}

// Only mock libraries in test environment
if (typeof vi !== 'undefined') {
  // Mock React Testing Library's render function to avoid DOM issues
  vi.mock('@testing-library/react', () => {
    const original = vi.importActual('@testing-library/react')
    return {
      ...original,
      render: vi.fn(() => {
        // Return a minimal mock render result
        return {
          container: {
            firstChild: {
              nodeType: 1,
            },
          },
          getByText: vi.fn(),
          getByRole: vi.fn(),
          getByTestId: vi.fn(),
          queryByText: vi.fn(),
          queryByRole: vi.fn(),
          queryByTestId: vi.fn(),
          findByText: vi.fn(() => Promise.resolve({})),
          findByRole: vi.fn(() => Promise.resolve({})),
          findByTestId: vi.fn(() => Promise.resolve({})),
          debug: vi.fn(),
          unmount: vi.fn(),
        }
      }),
    }
  })

  // Mock sonner to avoid DOM issues
  vi.mock('sonner', () => ({
    Toaster: vi.fn(() => null),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
    },
  }))
}
