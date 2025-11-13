package com.example.crossword.service;

import com.example.crossword.dto.dtoUser.UserDto;
import com.example.crossword.dto.dtoUser.UserRegAuthDto;
import com.example.crossword.enitity.User;
import com.example.crossword.mapper.UserMapper;
import com.example.crossword.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    @Autowired
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }
    public UserDto registerUser(UserRegAuthDto userRegAuthDto){

        if(userRepository.existsByLogin(userRegAuthDto.getLogin())){
            throw new RuntimeException("Пользователь с логином " + userRegAuthDto.getLogin() + " уже существует");
        }
        User user = userMapper.toEntity(userRegAuthDto);
        user.setPassword(userRegAuthDto.getPassword());
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }
    public UserDto authUser(UserRegAuthDto userRegAuthDto){
        Optional<User> userOptional = userRepository.findByLogin(userRegAuthDto.getLogin());
        if(userOptional.isEmpty()){
            throw new RuntimeException("Пользователь не найден");
        }
        User user = userOptional.get();
        if(!user.getPassword().equals(userRegAuthDto.getPassword())){
            throw new RuntimeException("Неверный пароль");
        }
        return userMapper.toDto(user);
    }
    public void deleteUser(Long id){
        if(!userRepository.existsById(id)){
            throw new RuntimeException("Пользователь не найден");
        }
        userRepository.deleteById(id);
    }
    public UserDto setAdmin(Long id, Boolean is_admin){
        Optional<User> userOptional = userRepository.findById(id);
        if(userOptional.isEmpty()){
            throw new RuntimeException("Пользователь не найден");
        }
        User user = userOptional.get();
        user.setIs_admin(is_admin);
        User updUser = userRepository.save(user);
        return userMapper.toDto(updUser);
    }
    public UserDto getUserById(Long id){
        Optional<User> userOptional = userRepository.findById(id);
        if(userOptional.isEmpty()){
            throw new RuntimeException("Пользователь не найден");
        }
        User user = userOptional.get();
        return userMapper.toDto(user);
    }
    public UserDto getUserByLogin(String login){
        Optional<User> userOptional = userRepository.findByLogin(login);
        if(userOptional.isEmpty()){
            throw new RuntimeException("Пользователь не найден");
        }
        User user = userOptional.get();
        return userMapper.toDto(user);
    }
    public List<UserDto> getAllUsers(){
        List<User> userList = userRepository.findAll();
        return userList.stream()
                .map(userMapper::toDto)
                .toList();
    }
}
