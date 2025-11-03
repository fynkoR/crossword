package com.example.crossword.controller;

import com.example.crossword.dtoGame.GameActionDto;
import com.example.crossword.dtoGame.GameDto;
import com.example.crossword.dtoGame.GameResultDto;
import com.example.crossword.service.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }
    @PostMapping
    public GameResultDto startGame(@RequestBody GameActionDto action) {
        return gameService.startGame(action);
    }
    /**
     * Выполнить действие с игрой (универсальный endpoint)
     */
    @PostMapping("/{id}/action")
    public GameResultDto gameAction(@PathVariable int id, @RequestBody GameActionDto action) {
        return gameService.handleAction(id, action);
    }
    @GetMapping("/{id}")
    public GameDto getGame(@PathVariable int id) {
        return gameService.getGameById(id);
    }
    @GetMapping("/user/{userId}")
    public List<GameDto> getUserGames(@PathVariable int userId) {
        return gameService.getGamesByUser(userId);
    }
    @DeleteMapping("/{id}")
    public void deleteGame(@PathVariable int id) {
        gameService.deleteGame(id);
    }
}
