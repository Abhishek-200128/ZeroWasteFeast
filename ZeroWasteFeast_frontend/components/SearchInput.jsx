import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";

import { icons } from "../constants";

const SearchInput = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
      <View
        className="border-2 border-black-200 w-full h-12 px-4 bg-black-100 rounded-2xl
      focus:border-secondary items-center flex-row space-x-4" 
      >
        <TextInput
          className="flex-1 text-white text-base mt-0.5 font-pregular"
          value={value}
          placeholder="Search for a video topic"
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
        />

        {title === 'Password' && (
            <TouchableOpacity onPress={() =>
                setShowPassword(!showPassword)
            }>
              <Image source={!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6" resizeMode="contain"/>    
            </TouchableOpacity>
        )}
        <TouchableOpacity>
            <Image 
            source={icons.search}
            className='w-5 h-5'
            resizeMode="contain"
            />
        </TouchableOpacity>
      </View>
  );
};

export default SearchInput;
