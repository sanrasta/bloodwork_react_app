import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Test component for CodeRabbit review
interface PatientData {
  name: string;
  birthYear: number;
}

interface TestComponentProps {
  patientData: PatientData;
  onPress: (data: PatientData) => void;
}

const TestComponent = ({ patientData, onPress }: TestComponentProps) => {
  const handlePress = () => {
    // Remove console.log for security - patient data should not be logged
    onPress(patientData);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16 }}>
        Patient: {patientData.name}
      </Text>
      <Text>
        Age: {new Date().getFullYear() - patientData.birthYear}
      </Text>
      <TouchableOpacity onPress={handlePress}>
        <Text style={{ color: 'blue' }}>
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestComponent;
