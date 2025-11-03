package com.example.crossword.controller;

import com.example.crossword.dtoUser.UserDto;
import com.example.crossword.dtoUser.UserRegAuthDto;
import com.example.crossword.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping("/register")
    public void register(@RequestBody UserRegAuthDto userRegAuthDto) {
        userService.registerUser(userRegAuthDto);
    }
    @PostMapping("/auth")
    public void auth (@RequestBody UserRegAuthDto userRegAuthDto) {
        userService.authUser(userRegAuthDto);
    }
    @GetMapping("/{id}")
    public UserDto getUserDto(@PathVariable Integer id)
    {
        return userService.getUserById(id);
    }
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
    }
    @PatchMapping("/{id}/admin")
    public void setAdmin(@PathVariable Integer id, @RequestParam Boolean is_admin) {
        userService.setAdmin(id, is_admin);
    }
}
