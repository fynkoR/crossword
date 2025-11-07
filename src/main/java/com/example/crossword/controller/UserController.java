package com.example.crossword.controller;

import com.example.crossword.dtoUser.UserDto;
import com.example.crossword.dtoUser.UserRegAuthDto;
import com.example.crossword.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для работы с пользователями
 */
@RestController
@RequestMapping("/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Регистрация нового пользователя
     * POST /users/register
     */
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserRegAuthDto userRegAuthDto) {
        try {
            UserDto registeredUser = userService.registerUser(userRegAuthDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Авторизация пользователя
     * POST /users/auth
     */
    @PostMapping("/auth")
    public ResponseEntity<UserDto> auth(@RequestBody UserRegAuthDto userRegAuthDto) {
        try {
            UserDto authenticatedUser = userService.authUser(userRegAuthDto);
            return ResponseEntity.ok(authenticatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Получить пользователя по ID
     * GET /users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserDto(@PathVariable Integer id) {
        try {
            UserDto user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить пользователя по логину
     * GET /users/login/{login}
     */
    @GetMapping("/login/{login}")
    public ResponseEntity<UserDto> getUserByLogin(@PathVariable String login) {
        try {
            UserDto user = userService.getUserByLogin(login);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить всех пользователей
     * GET /users
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Удалить пользователя
     * DELETE /users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Установить/снять права администратора
     * PATCH /users/{id}/admin
     */
    @PatchMapping("/{id}/admin")
    public ResponseEntity<UserDto> setAdmin(@PathVariable Integer id, @RequestParam Boolean is_admin) {
        try {
            UserDto updatedUser = userService.setAdmin(id, is_admin);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
