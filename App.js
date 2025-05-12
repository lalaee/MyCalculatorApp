import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

const App = () => {
  const [currentValue, setCurrentValue] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [isNewCalculation, setIsNewCalculation] = useState(true);

  const handleNumberInput = (value) => {
    if (currentValue === "Error") {
      setCurrentValue(value);
      setIsNewCalculation(false);
      return;
    }
    if (isNewCalculation || currentValue === "0") {
      if (value === "." && currentValue.includes(".")) return;
      setCurrentValue(value === "." ? "0." : value);
      setIsNewCalculation(false);
    } else {
      // Limit length slightly for display
      if (currentValue.length >= 15) return;
      if (value === "." && currentValue.includes(".")) return;
      setCurrentValue(currentValue + value);
    }
  };

  const performCalculation = () => {
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    if (isNaN(prev) || isNaN(current)) return "Error";

    let result;
    switch (operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*': // Internal logic still uses '*'
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          return "Error";
        }
        result = prev / current;
        break;
      default:
        return current.toString();
    }
    // Handle potential floating point inaccuracies & limit display length
    let resultString = result.toString();
     if (resultString.includes(".") && resultString.split('.')[1].length > 8) {
        resultString = parseFloat(result.toFixed(8)).toString();
    }
    if (resultString.length > 15) { // Limit overall result length for display
        resultString = parseFloat(resultString).toExponential(8);
    }

    return resultString;
  };

  const handleOperatorInput = (op) => {
    if (currentValue === "Error") return;

    // Allow changing operator if no new number entered yet
    if (isNewCalculation && previousValue !== null) {
        setOperator(op);
        return;
    }

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
    } else if (previousValue === null || isNewCalculation) {
        setPreviousValue(currentValue);
    }
    setOperator(op);
    setIsNewCalculation(true);
  };


  const handleEquals = () => {
    if (previousValue === null || operator === null || currentValue === "Error" || isNewCalculation) {
      return;
    }
    const result = performCalculation();
    setCurrentValue(result);
    setPreviousValue(null);
    setOperator(null);
    setIsNewCalculation(true);
  };

  const handleClear = () => {
    setCurrentValue("0");
    setPreviousValue(null);
    setOperator(null);
    setIsNewCalculation(true);
  };

  const handleSpecialOperator = (op) => {
     if (currentValue === "Error") return;
    if (op === '+/-') {
        if (currentValue === "0") return;
        setCurrentValue((parseFloat(currentValue) * -1).toString());
        // Keep isNewCalculation as it was - allows toggling sign repeatedly
    } else if (op === '%') {
        if (currentValue === "0") return;
        // Perform % calculation relative to previous value if in sequence, else treat as /100
         if (operator && previousValue) {
             const current = parseFloat(currentValue);
             const prev = parseFloat(previousValue);
             if (!isNaN(prev) && !isNaN(current)) {
                setCurrentValue(((prev * current) / 100).toString());
             }
         } else {
             setCurrentValue((parseFloat(currentValue) / 100).toString());
         }
        // Don't set isNewCalculation=true, allow further typing or hitting equals
        setIsNewCalculation(false); // Allow further editing/equals
    }
  };

  // --- Button Definition ---
  const buttons = [
    [{ label: 'C', type: 'special', onPress: handleClear }, // Changed 'clear' to 'special' for coloring
     { label: '+/-', type: 'special', onPress: () => handleSpecialOperator('+/-') },
     { label: '%', type: 'special', onPress: () => handleSpecialOperator('%') },
     { label: '/', type: 'operator', onPress: () => handleOperatorInput('/') }],
    [{ label: '7', type: 'number', onPress: () => handleNumberInput('7') },
     { label: '8', type: 'number', onPress: () => handleNumberInput('8') },
     { label: '9', type: 'number', onPress: () => handleNumberInput('9') },
     { label: '×', type: 'operator', onPress: () => handleOperatorInput('*') }], // Label changed, logic uses '*'
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
     { label: '=', type: 'equals', onPress: handleEquals }] // 'equals' type for coloring
  ];

  // --- Text Color Logic ---
  const getButtonTextColor = (type) => {
    if (type === 'number') return '#D3D3D3'; // Light Gray
    if (type === 'special') return '#808080'; // Medium Gray (for C, +/-, %)
    if (type === 'operator' || type === 'equals') return '#FFA500'; // Orange
    return '#FFFFFF'; // Default fallback (shouldn't be needed)
  };

  // --- Dynamic Sizing ---
  const screenWidth = Dimensions.get('window').width;
  // Calculate base size for one button width unit
  const buttonUnitSize = screenWidth / 4 - 12; // Roughly 4 buttons per row with margin factored in

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        {previousValue !== null && operator && !isNewCalculation && ( // Only show previous value when entering second operand
          <Text style={styles.previousInputText}>
            {`${previousValue} ${operator === '*' ? '×' : operator}`}
          </Text>
        )}
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {currentValue}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((button) => {
                // Calculate the width for this specific button
                const buttonWidth = button.style?.flex
                    ? (buttonUnitSize * button.style.flex + (button.style.flex -1) * 10) // Span multiple units + margins
                    : buttonUnitSize; // Standard single unit width

                return (
                  <TouchableOpacity
                    key={button.label}
                    style={[
                      styles.button, // Base button style (alignment, margins, touch area size)
                      {
                        width: buttonWidth, // Apply calculated width
                        height: buttonUnitSize, // Keep height consistent (square aspect ratio for touch area)
                        // NO backgroundColor or borderRadius here
                      },
                      // button.style // Apply specific styles like flex if needed (mainly for width calculation now)
                    ]}
                    onPress={button.onPress}
                  >
                    <Text style={[
                      styles.buttonText, // Base text style (font size, weight)
                      { color: getButtonTextColor(button.type) } // Apply dynamic text color
                    ]}>
                      {button.label}
                    </Text>
                  </TouchableOpacity>
                );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C', // Near-black background remains
    justifyContent: 'flex-end',
  },
  displayContainer: {
    paddingHorizontal: 30, // Increased padding slightly
    paddingBottom: 20,     // Reduced bottom padding
    paddingTop: 60,        // Increased top padding for more space
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 150,         // Adjusted min height
  },
  previousInputText: {
    fontSize: 24,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  displayText: {
    fontSize: 80, // Slightly larger display text
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'right', // Ensure right alignment
  },
  buttonContainer: {
    paddingBottom: 30, // More padding at the very bottom
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, // Increased spacing between rows
  },
  button: {
    // Responsible for alignment and touch area size/spacing
    alignItems: 'center',       // Center text horizontally
    justifyContent: 'center',   // Center text vertically
    margin: 5,                 // Spacing remains
    // width and height are set dynamically inline
    // NO backgroundColor, NO borderRadius
  },
  buttonText: {
    fontSize: 36, // Slightly larger button text
    fontWeight: '400', // Slightly adjusted font weight
    // color is set dynamically inline
  },
});

export default App;