import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

const App = () => {
  const [currentValue, setCurrentValue] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [isNewCalculation, setIsNewCalculation] = useState(true); // To handle if the next number should overwrite

  const handleNumberInput = (value) => {
    if (currentValue === "Error") {
      setCurrentValue(value);
      setIsNewCalculation(false);
      return;
    }
    if (isNewCalculation || currentValue === "0") {
      if (value === "." && currentValue.includes(".")) return; // Prevent multiple decimals if starting new
      setCurrentValue(value === "." ? "0." : value);
      setIsNewCalculation(false);
    } else {
      if (value === "." && currentValue.includes(".")) return; // Prevent multiple decimals
      setCurrentValue(currentValue + value);
    }
  };

  const performCalculation = () => {
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    if (isNaN(prev) || isNaN(current)) return "Error"; // Should not happen with proper input handling

    let result;
    switch (operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          return "Error";
        }
        result = prev / current;
        break;
      default:
        return current.toString(); // Should not happen
    }
    // Handle potential floating point inaccuracies for simple cases
    if (result.toString().includes(".") && result.toString().split('.')[1].length > 8) {
        return parseFloat(result.toFixed(8)).toString();
    }
    return result.toString();
  };

  const handleOperatorInput = (op) => {
    if (currentValue === "Error") return;

    if (previousValue !== null && operator && !isNewCalculation) {
      const result = performCalculation();
      setCurrentValue(result);
      if (result === "Error") {
        setPreviousValue(null);
        setOperator(null);
        setIsNewCalculation(true);
        return;
      }
      setPreviousValue(result);
    } else if (previousValue === null || isNewCalculation) { // if it's the first operator or after equals
        setPreviousValue(currentValue);
    }
    setOperator(op);
    setIsNewCalculation(true); // Next number input will start a new number
  };


  const handleEquals = () => {
    if (previousValue === null || operator === null || currentValue === "Error" || isNewCalculation) {
      // if isNewCalculation is true, it means an operator was just pressed, so the current display is not the second operand yet.
      // Or, if there's no previous value or operator.
      return;
    }
    const result = performCalculation();
    setCurrentValue(result);
    setPreviousValue(null);
    setOperator(null);
    setIsNewCalculation(true); // Ready for a new calculation
  };

  const handleClear = () => {
    setCurrentValue("0");
    setPreviousValue(null);
    setOperator(null);
    setIsNewCalculation(true);
  };

  // For buttons like +/- or % (not implemented in core logic but placeholder for layout)
  const handleSpecialOperator = (op) => {
    if (op === '+/-') {
        if (currentValue === "Error" || currentValue === "0") return;
        setCurrentValue((parseFloat(currentValue) * -1).toString());
        setIsNewCalculation(false); // Allow further editing of this number
    } else if (op === '%') {
        if (currentValue === "Error" || currentValue === "0") return;
        setCurrentValue((parseFloat(currentValue) / 100).toString());
        setIsNewCalculation(false); // Allow further editing of this number
    }
  };


  const buttons = [
    [{ label: 'C', type: 'clear', onPress: handleClear },
     { label: '+/-', type: 'special', onPress: () => handleSpecialOperator('+/-') },
     { label: '%', type: 'special', onPress: () => handleSpecialOperator('%') },
     { label: '/', type: 'operator', onPress: () => handleOperatorInput('/') }],
    [{ label: '7', type: 'number', onPress: () => handleNumberInput('7') },
     { label: '8', type: 'number', onPress: () => handleNumberInput('8') },
     { label: '9', type: 'number', onPress: () => handleNumberInput('9') },
     { label: '*', type: 'operator', onPress: () => handleOperatorInput('*') }],
    [{ label: '4', type: 'number', onPress: () => handleNumberInput('4') },
     { label: '5', type: 'number', onPress: () => handleNumberInput('5') },
     { label: '6', type: 'number', onPress: () => handleNumberInput('6') },
     { label: '-', type: 'operator', onPress: () => handleOperatorInput('-') }],
    [{ label: '1', type: 'number', onPress: () => handleNumberInput('1') },
     { label: '2', type: 'number', onPress: () => handleNumberInput('2') },
     { label: '3', type: 'number', onPress: () => handleNumberInput('3') },
     { label: '+', type: 'operator', onPress: () => handleOperatorInput('+') }],
    [{ label: '0', type: 'number', onPress: () => handleNumberInput('0'), style: { flex: 2 } }, // Wider button
     { label: '.', type: 'number', onPress: () => handleNumberInput('.') },
     { label: '=', type: 'equals', onPress: handleEquals }]
  ];

  const getButtonBackgroundColor = (type) => {
    if (type === 'number') return '#333333';
    if (type === 'operator' || type === 'equals') return '#FFA500';
    if (type === 'clear' || type === 'special') return '#A9A9A9';
    return '#333333'; // Default
  };

  const getButtonTextColor = (type) => {
    if (type === 'clear' || type === 'special') return '#000000';
    return '#FFFFFF';
  };

  // Adjust button size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const buttonSize = screenWidth / 4 - 12; // 4 buttons per row, with some margin

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        {previousValue !== null && operator && (
          <Text style={styles.previousInputText}>
            {`${previousValue} ${operator}`}
          </Text>
        )}
        <Text style={styles.displayText} numberOfLines={1} ellipsizeMode="head">
          {currentValue}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((button) => (
              <TouchableOpacity
                key={button.label}
                style={[
                  styles.button,
                  {
                    backgroundColor: getButtonBackgroundColor(button.type),
                    width: button.style?.flex ? (buttonSize * button.style.flex + (button.style.flex -1) * 10) : buttonSize, // Adjust width for wider button
                    height: buttonSize,
                    borderRadius: buttonSize / 2, // Circular buttons
                  },
                  button.style // Apply additional styles like flex for '0'
                ]}
                onPress={button.onPress}
              >
                <Text style={[styles.buttonText, { color: getButtonTextColor(button.type) }]}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C', // Near-black background
    justifyContent: 'flex-end', // Align calculator to bottom
  },
  displayContainer: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 120, // Ensure enough space for previous input and current value
  },
  previousInputText: {
    fontSize: 24,
    color: '#A0A0A0', // Lighter gray for previous input
    marginBottom: 5,
  },
  displayText: {
    fontSize: 70,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  buttonContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute buttons evenly
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5, // Spacing between buttons
    // width and height are set dynamically
    // borderRadius is set dynamically for circular shape
  },
  buttonText: {
    fontSize: 30, // Clear, sans-serif font (React Native default is San Francisco/Roboto)
    fontWeight: '500',
  },
});

export default App;