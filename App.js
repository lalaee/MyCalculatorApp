import React, { useState, useRef } from 'react'; // Import useRef
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity, // Keep this for type reference if needed, but use Animated.TouchableOpacity
  SafeAreaView,
  Dimensions,
  Animated // Import Animated
} from 'react-native';

// --- Reusable Animated Button Component ---
const AnimatedButton = ({ label, type, onPress, style: customStyle, textStyle: customTextStyle }) => {
    // useRef to keep Animated.Value persistent per button instance
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95, // Scale down slightly
            useNativeDriver: true, // Use native driver for performance (scale is supported)
            // Optional: adjust spring parameters for feel
            // friction: 7,
            // tension: 40,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1, // Scale back to normal
            useNativeDriver: true,
             // Optional: adjust spring parameters for feel
            friction: 4, // Lower friction for a bit quicker snap back
            tension: 60,
        }).start();

        // Trigger the original onPress function passed in props on release
        if (onPress) {
            onPress();
        }
    };

    // Style object for the scale transform
    const animatedStyle = {
        transform: [{ scale: scaleValue }]
    };

    return (
        // Use Animated.View wrapper around TouchableOpacity or make TouchableOpacity animated
        // Let's use Animated.View wrapper as it's often more flexible
         <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={[styles.button, customStyle]} // Combine base and custom styles for layout
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9} // Adjust or remove if scale provides enough feedback
                // onPress is handled by onPressOut now
            >
                <Text style={[styles.buttonText, customTextStyle]}>
                    {label}
                </Text>
            </TouchableOpacity>
         </Animated.View>
    );
};


// --- Main App Component (mostly unchanged logic) ---
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
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/':
        if (current === 0) return "Error";
        result = prev / current;
        break;
      default: return current.toString();
    }
    let resultString = result.toString();
     if (resultString.includes(".") && resultString.split('.')[1].length > 8) {
        resultString = parseFloat(result.toFixed(8)).toString();
    }
    if (resultString.length > 15 && !resultString.includes('e')) {
        resultString = parseFloat(resultString).toExponential(8);
    }
    return resultString;
  };

  const handleOperatorInput = (op) => {
    if (currentValue === "Error") return;
    if (isNewCalculation && previousValue !== null) {
        setOperator(op);
        return;
    }
    if (previousValue !== null && operator && !isNewCalculation) {
      const result = performCalculation();
      setCurrentValue(result);
      if (result === "Error") {
        setPreviousValue(null); setOperator(null); setIsNewCalculation(true); return;
      }
      setPreviousValue(result);
    } else if (previousValue === null || isNewCalculation) {
        setPreviousValue(currentValue);
    }
    setOperator(op);
    setIsNewCalculation(true);
  };

  const handleEquals = () => {
    if (previousValue === null || operator === null || currentValue === "Error" || isNewCalculation) return;
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
    } else if (op === '%') {
        if (currentValue === "0") return;
         if (operator && previousValue) {
             const current = parseFloat(currentValue);
             const prev = parseFloat(previousValue);
             if (!isNaN(prev) && !isNaN(current)) {
                setCurrentValue(((prev * current) / 100).toString());
             }
         } else {
             setCurrentValue((parseFloat(currentValue) / 100).toString());
         }
        setIsNewCalculation(false);
    }
  };

  // --- Button Definition (Unchanged) ---
  const buttons = [
    [{ label: 'C', type: 'special', onPress: handleClear },
     { label: '+/-', type: 'special', onPress: () => handleSpecialOperator('+/-') },
     { label: '%', type: 'special', onPress: () => handleSpecialOperator('%') },
     { label: '/', type: 'operator', onPress: () => handleOperatorInput('/') }],
    [{ label: '7', type: 'number', onPress: () => handleNumberInput('7') },
     { label: '8', type: 'number', onPress: () => handleNumberInput('8') },
     { label: '9', type: 'number', onPress: () => handleNumberInput('9') },
     { label: '×', type: 'operator', onPress: () => handleOperatorInput('*') }],
    [{ label: '4', type: 'number', onPress: () => handleNumberInput('4') },
     { label: '5', type: 'number', onPress: () => handleNumberInput('5') },
     { label: '6', type: 'number', onPress: () => handleNumberInput('6') },
     { label: '-', type: 'operator', onPress: () => handleOperatorInput('-') }],
    [{ label: '1', type: 'number', onPress: () => handleNumberInput('1') },
     { label: '2', type: 'number', onPress: () => handleNumberInput('2') },
     { label: '3', type: 'number', onPress: () => handleNumberInput('3') },
     { label: '+', type: 'operator', onPress: () => handleOperatorInput('+') }],
    [{ label: '0', type: 'number', onPress: () => handleNumberInput('0'), style: { flex: 2 } },
     { label: '.', type: 'number', onPress: () => handleNumberInput('.') },
     { label: '=', type: 'equals', onPress: handleEquals }]
  ];

  // --- Text Color Logic (Unchanged) ---
  const getButtonTextColor = (type) => {
    if (type === 'number') return '#D3D3D3';
    if (type === 'special') return '#808080';
    if (type === 'operator' || type === 'equals') return '#FFA500';
    return '#FFFFFF';
  };

  // --- Dynamic Sizing (Unchanged) ---
  const screenWidth = Dimensions.get('window').width;
  const buttonUnitSize = screenWidth / 4 - 12;

  // --- Render Section ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Display Area (Unchanged) */}
      <View style={styles.displayContainer}>
        {previousValue !== null && operator && !isNewCalculation && (
          <Text style={styles.previousInputText}>
            {`${previousValue} ${operator === '*' ? '×' : operator}`}
          </Text>
        )}
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {currentValue}
        </Text>
      </View>

      {/* Button Area - Now using AnimatedButton */}
      <View style={styles.buttonContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((button) => {
                // Calculate width for layout consistency
                const buttonWidth = button.style?.flex
                    ? (buttonUnitSize * button.style.flex + (button.style.flex -1) * 10)
                    : buttonUnitSize;

                // Prepare styles to pass to AnimatedButton
                const buttonStyle = {
                    width: buttonWidth,
                    height: buttonUnitSize,
                 };
                 const textStyle = {
                     color: getButtonTextColor(button.type)
                 };

                // Render the AnimatedButton component
                return (
                  <AnimatedButton
                    key={button.label}
                    label={button.label}
                    type={button.type}
                    onPress={button.onPress}
                    style={buttonStyle} // Pass layout styles
                    textStyle={textStyle} // Pass text color style
                  />
                );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

// --- Styles (Mostly Unchanged) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: 60,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 150,
  },
  previousInputText: {
    fontSize: 24,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  displayText: {
    fontSize: 80,
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'right',
  },
  buttonContainer: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensure spacing is handled correctly by the row
    marginBottom: 15,
    alignItems: 'center', // Center buttons vertically if heights differ slightly
  },
  // Style applied to the TouchableOpacity INSIDE AnimatedButton
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5, // Keep margin for spacing between touch areas
     // width and height are now passed dynamically via props to AnimatedButton's style prop
  },
  // Style applied to the Text INSIDE AnimatedButton
  buttonText: {
    fontSize: 36,
    fontWeight: '400',
    // color is now passed dynamically via props to AnimatedButton's textStyle prop
  },
});

export default App;