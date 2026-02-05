# Jest + React Native Testing Library Setup Guide

## Overview

This project is configured with Jest and React Native Testing Library for comprehensive testing of React Native components, stores, and APIs.

## Installation

All dependencies are already installed. Key packages:
- `jest` - Testing framework
- `@testing-library/react-native` - React Native testing utilities
- `@testing-library/jest-native` - Jest matchers for React Native
- `babel-jest` - Babel transformer for Jest

## Configuration Files

### jest.config.js
Main Jest configuration file with:
- React Native preset
- Module transformation setup
- Coverage configuration
- Test patterns

### jest.setup.js
Runs before all tests to:
- Mock AsyncStorage
- Mock socket.io-client
- Mock React Native modules
- Configure global test environment

### babel.config.js
Babel configuration for:
- JSX transformation
- TypeScript support
- Plugin configuration

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in `src/__tests__/` with the following structure:

```
src/__tests__/
├── api/           # API client tests
├── store/         # Zustand store tests
├── components/    # React Native component tests
└── setup/         # Test utilities and helpers
```

## Writing Tests

### 1. Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<MyComponent />);
    expect(getByTestId('my-element')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    const mockHandler = jest.fn();
    const { getByTestId } = render(
      <MyComponent onPress={mockHandler} />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### 2. Store Tests

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMyStore } from '../store';

describe('MyStore', () => {
  it('should update state', async () => {
    const { result } = renderHook(() => useMyStore());

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### 3. API Tests

```typescript
import { myApi } from '../api';

jest.mock('../api');

describe('MyAPI', () => {
  it('should fetch data', async () => {
    const mockData = { id: 1, name: 'Test' };
    (myApi.getData as jest.Mock).mockResolvedValue({
      data: mockData
    });

    const result = await myApi.getData();
    expect(result.data).toEqual(mockData);
  });
});
```

## Test Utilities

Located in `src/__tests__/setup/test-utils.ts`:

### Custom Render
```typescript
import { render } from '../__tests__/setup/test-utils';

// Automatically wraps component with providers
render(<MyComponent />);
```

### Test Data Factories
```typescript
import { testDataFactories } from '../__tests__/setup/test-utils';

const mockPost = testDataFactories.createMockPost({ content: 'Custom' });
const mockChannel = testDataFactories.createMockChannel({ name: 'Test' });
const mockUser = testDataFactories.createMockUser({ email: 'test@example.com' });
```

## Best Practices

1. **Use testID**: Add `testID` prop to components for easier querying
   ```tsx
   <Button testID="my-button" />
   ```

2. **Test User Behavior**: Test what users see and do, not implementation details
   ```typescript
   // Good
   expect(screen.getByText('Welcome')).toBeTruthy();
   
   // Avoid
   expect(component.state.isVisible).toBe(true);
   ```

3. **Mock External Services**: Mock API calls and async operations
   ```typescript
   jest.mock('../api/channels');
   ```

4. **Use act() for State Updates**: Wrap state updates in `act()`
   ```typescript
   await act(async () => {
     await result.current.fetchData();
   });
   ```

5. **Keep Tests Focused**: One assertion per test when possible
   ```typescript
   // Good
   it('should render title', () => { ... });
   it('should handle click', () => { ... });
   
   // Avoid combining multiple behaviors
   ```

6. **Use Factories**: Create test data with factories
   ```typescript
   const post = testDataFactories.createMockPost();
   ```

7. **Clean Up After Tests**: Reset mocks and state
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
     useStore.setState({ initialState });
   });
   ```

## Coverage Goals

Current coverage thresholds (configurable in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

Increase these as your test suite grows.

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should load data', async () => {
  const { result } = renderHook(() => useMyStore());

  await act(async () => {
    await result.current.loadData();
  });

  expect(result.current.data).toBeDefined();
});
```

### Testing User Input
```typescript
it('should update on text input', () => {
  const { getByTestId } = render(<TextInput />);
  const input = getByTestId('text-input');

  fireEvent.changeText(input, 'hello');
  expect(input.props.value).toBe('hello');
});
```

### Testing Conditional Rendering
```typescript
it('should show error when invalid', () => {
  const { queryByTestId } = render(<Form />);
  expect(queryByTestId('error-message')).toBeNull();

  // Trigger error
  fireEvent.press(getByTestId('submit'));
  
  expect(queryByTestId('error-message')).toBeTruthy();
});
```

### Mocking Hooks
```typescript
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test' },
    isLoading: false,
  })
}));
```

## Debugging Tests

### Debug Output
```typescript
import { render, screen } from '@testing-library/react-native';

const { debug } = render(<MyComponent />);
debug(); // Prints the component tree
```

### Console Output
```typescript
console.log(screen.getByTestId('element').props);
```

### Watch Mode
```bash
npm run test:watch

# Then press 'a' to run all tests
# Press 'f' to run failed tests
# Press 'p' to filter by file name
```

## Troubleshooting

### Module Resolution Issues
If imports are failing, check:
1. Module path in `jest.config.js` `moduleNameMapper`
2. File extensions in `transform` config
3. `transformIgnorePatterns` for third-party modules

### AsyncStorage Warnings
AsyncStorage is mocked in `jest.setup.js`. If you see warnings, clear mocks:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### State Not Updating
Always wrap state updates in `act()`:
```typescript
await act(async () => {
  fireEvent.press(button);
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Docs](https://testing-library.com/docs/queries/about)
- [Zustand Testing](https://docs.pmnd.rs/zustand/guides/testing)

## Next Steps

1. Add tests for all new components
2. Improve coverage to 80%+
3. Set up CI/CD testing
4. Add snapshot tests for UI consistency
5. Implement E2E tests with Detox
