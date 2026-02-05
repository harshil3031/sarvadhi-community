/**
 * Example Component Tests
 * 
 * Demonstrates testing React Native components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, View, Button } from 'react-native';

/**
 * Simple test component for demonstration
 */
const SimpleButton: React.FC<{
  title: string;
  onPress: () => void;
}> = ({ title, onPress }) => {
  return (
    <Button
      title={title}
      onPress={onPress}
      testID="test-button"
    />
  );
};

describe('SimpleButton Component', () => {
  it('should render with correct title', () => {
    const mockPress = jest.fn();
    render(
      <SimpleButton
        title="Press Me"
        onPress={mockPress}
      />
    );

    // Find button by testID
    const button = screen.getByTestId('test-button');
    expect(button).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(
      <SimpleButton
        title="Press Me"
        onPress={mockPress}
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);

    expect(mockPress).toHaveBeenCalled();
  });

  it('should call onPress multiple times', () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(
      <SimpleButton
        title="Press Me"
        onPress={mockPress}
      />
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockPress).toHaveBeenCalledTimes(2);
  });
});

/**
 * Counter component for state testing
 */
const Counter: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <View>
      <Text testID="counter-text">{count}</Text>
      <Button
        title="Increment"
        onPress={() => setCount(count + 1)}
        testID="increment-button"
      />
      <Button
        title="Decrement"
        onPress={() => setCount(count - 1)}
        testID="decrement-button"
      />
    </View>
  );
};

describe('Counter Component', () => {
  it('should initialize with count of 0', () => {
    const { getByTestId } = render(<Counter />);
    const counterText = getByTestId('counter-text');

    expect(counterText.props.children).toBe(0);
  });

  it('should increment count', () => {
    const { getByTestId } = render(<Counter />);
    const incrementButton = getByTestId('increment-button');
    const counterText = getByTestId('counter-text');

    fireEvent.press(incrementButton);

    expect(counterText.props.children).toBe(1);
  });

  it('should decrement count', () => {
    const { getByTestId } = render(<Counter />);
    const incrementButton = getByTestId('increment-button');
    const decrementButton = getByTestId('decrement-button');
    const counterText = getByTestId('counter-text');

    fireEvent.press(incrementButton);
    fireEvent.press(decrementButton);

    expect(counterText.props.children).toBe(0);
  });

  it('should handle multiple increments', () => {
    const { getByTestId } = render(<Counter />);
    const incrementButton = getByTestId('increment-button');
    const counterText = getByTestId('counter-text');

    fireEvent.press(incrementButton);
    fireEvent.press(incrementButton);
    fireEvent.press(incrementButton);

    expect(counterText.props.children).toBe(3);
  });
});

/**
 * Conditional rendering component
 */
const Conditional: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <View>
      {show && <Text testID="visible-text">Visible</Text>}
      {!show && <Text testID="hidden-text">Hidden</Text>}
    </View>
  );
};

describe('Conditional Component', () => {
  it('should show text when show is true', () => {
    const { getByTestId, queryByTestId } = render(<Conditional show={true} />);

    expect(getByTestId('visible-text')).toBeTruthy();
    expect(queryByTestId('hidden-text')).toBeNull();
  });

  it('should hide text when show is false', () => {
    const { getByTestId, queryByTestId } = render(
      <Conditional show={false} />
    );

    expect(getByTestId('hidden-text')).toBeTruthy();
    expect(queryByTestId('visible-text')).toBeNull();
  });
});
