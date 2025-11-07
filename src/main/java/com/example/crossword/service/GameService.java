package com.example.crossword.service;

import com.example.crossword.dtoCrossword.CrosswordWords;
import com.example.crossword.dtoGame.*;
import com.example.crossword.enitity.Crossword;
import com.example.crossword.enitity.Game;
import com.example.crossword.enitity.User;
import com.example.crossword.mapper.GameMapper;
import com.example.crossword.repository.CrosswordRepository;
import com.example.crossword.repository.GameRepository;
import com.example.crossword.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GameService {
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final CrosswordRepository crosswordRepository;
    private final GameMapper gameMapper;
    private final CrosswordJsonService crosswordJsonService;

    public GameService(GameRepository gameRepository,
                       UserRepository userRepository,
                       CrosswordRepository crosswordRepository,
                       GameMapper gameMapper,
                       CrosswordJsonService crosswordJsonService) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.crosswordRepository = crosswordRepository;
        this.gameMapper = gameMapper;
        this.crosswordJsonService = crosswordJsonService;
    }

    /**
     * Универсальный метод для всех действий с игрой
     */
    public GameResultDto handleAction(int gameId, GameActionDto action) {
        switch (action.getAction()) {
            case "check":
                return checkAnswer(gameId, action);
            case "hint":
                return useHint(gameId);
            case "complete":
                return completeGame(gameId);
            case "pause":
                return pauseGame(gameId);
            case "restart":
                return restartGame(gameId);
            case "save":
                return saveGame(gameId);
            default:
                return createResult(false, "Неизвестное действие: " + action.getAction(), null, false, null);
        }
    }

    /**
     * Начать новую игру
     */
    public GameResultDto startGame(GameActionDto action) {
        // Проверяем обязательные поля для старта игры
        if (action.getUserId() == null) {
            return createResult(false, "Не указан userId", null, false, null);
        }
        if (action.getCrosswordId() == null) {
            return createResult(false, "Не указан crosswordId", null, false, null);
        }

        User user = userRepository.findById(action.getUserId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найдена"));

        Crossword crossword = crosswordRepository.findById(action.getCrosswordId())
                .orElseThrow(() -> new RuntimeException("Кроссворд не найден"));

        // Проверяем, нет ли активной игры
        Optional<Game> existingGame = gameRepository.findByUserIdAndCrosswordIdAndGameOverFalse(
                action.getUserId(), action.getCrosswordId());

        if (existingGame.isPresent()) {
            GameDto gameDTO = gameMapper.toDTO(existingGame.get());
            return createResult(true, "Продолжаем существующую игру", null, false, gameDTO);
        }

        // Создаем новую игру
        Game game = new Game();
        game.setUser(user);
        game.setCrossword(crossword);
        game.setHints_used(0);
        game.setGame_over(false);
        game.setSolved_words_count(0);

        Game savedGame = gameRepository.save(game);
        GameDto gameDTO = gameMapper.toDTO(savedGame);

        return createResult(true, "Игра начата!", null, false, gameDTO);
    }

    /**
     * Проверить ответ
     */
    private GameResultDto checkAnswer(int gameId, GameActionDto action) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        if (game.isGame_over()) {
            return createResult(false, "Игра уже завершена", null, true, gameMapper.toDTO(game));
        }

        CrosswordWords words = crosswordJsonService.parseWordsData(game.getCrossword().getWords_data());

        // Ищем слово в кроссворде
        Optional<CrosswordWords.CrosswordWord> wordOpt = words.getWords().stream()
                .filter(w -> w.getWordId() == action.getWordId())
                .findFirst();

        if (wordOpt.isEmpty()) {
            return createResult(false, "Слово не найдено", null, false, gameMapper.toDTO(game));
        }

        CrosswordWords.CrosswordWord crosswordWord = wordOpt.get();
        boolean isCorrect = crosswordWord.getText().equalsIgnoreCase(action.getAnswer());

        if (isCorrect) {
            // Увеличиваем счетчик отгаданных слов
            game.setSolved_words_count(game.getSolved_words_count() + 1);

            // Проверяем завершена ли игра
            boolean gameComplete = checkIfGameComplete(game, words);

            if (gameComplete) {
                game.setGame_over(true);
                gameRepository.save(game);
                return createResult(true, "Поздравляем! Вы отгадали весь кроссворд!",
                        null, true, gameMapper.toDTO(game));
            } else {
                gameRepository.save(game);
                String message = "Правильно! Отгадано слов: " + game.getSolved_words_count() + " из " + words.getWords().size();
                return createResult(true, message, null, false, gameMapper.toDTO(game));
            }
        } else {
            return createResult(false, "Неправильный ответ", crosswordWord.getText(), false, gameMapper.toDTO(game));
        }
    }

    /**
     * Использовать подсказку
     */
    private GameResultDto useHint(int gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        if (game.isGame_over()) {
            return createResult(false, "Игра уже завершена", null, true, gameMapper.toDTO(game));
        }

        CrosswordWords words = crosswordJsonService.parseWordsData(game.getCrossword().getWords_data());
        String hint = getNextHint(words, game);

        game.setHints_used(game.getHints_used() + 1);
        gameRepository.save(game);

        int remainingHints = calculateRemainingHints(game);
        String message = "Подсказка использована. Осталось: " + remainingHints;

        return createResult(true, message, hint, false, gameMapper.toDTO(game));
    }

    /**
     * Завершить игру
     */
    private GameResultDto completeGame(int gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        game.setGame_over(true);
        Game savedGame = gameRepository.save(game);

        return createResult(true, "Игра завершена", null, true, gameMapper.toDTO(savedGame));
    }

    /**
     * Вспомогательные методы
     */
    private String getNextHint(CrosswordWords words, Game game) {
        if (!words.getWords().isEmpty()) {
            return String.valueOf(words.getWords().get(0).getText().charAt(0));
        }
        return "Нет доступных подсказок";
    }

    private int calculateRemainingHints(Game game) {
        CrosswordWords words = crosswordJsonService.parseWordsData(game.getCrossword().getWords_data());
        int maxHints = words.getWords().size() / 2;
        return Math.max(0, maxHints - game.getHints_used());
    }

    private boolean checkIfGameComplete(Game game, CrosswordWords words) {
        return game.getSolved_words_count() == words.getWords().size();
    }

    private GameResultDto createResult(boolean success, String message, String data,
                                       boolean gameComplete, GameDto game) {
        GameResultDto result = new GameResultDto();
        result.setSuccess(success);
        result.setMessage(message);
        result.setData(data);
        result.setGameComplete(gameComplete);
        result.setGame(game);
        return result;
    }

    /**
     * Методы для получения данных (без изменений)
     */
    public GameDto getGameById(int id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));
        return gameMapper.toDTO(game);
    }

    public List<GameDto> getGamesByUser(int userId) {
        List<Game> games = gameRepository.findByUserId(userId);
        return games.stream()
                .map(gameMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteGame(int id) {
        if (!gameRepository.existsById(id)) {
            throw new RuntimeException("Игра не найдена");
        }
        gameRepository.deleteById(id);
    }

    /**
     * Начать игру заново
     */
    private GameResultDto restartGame(int gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        // Сбрасываем прогресс
        game.setHints_used(0);
        game.setSolved_words_count(0);
        game.setGame_over(false);

        Game restartedGame = gameRepository.save(game);

        return createResult(true, "Игра начата заново", null, false, gameMapper.toDTO(restartedGame));
    }

    /**
     * Сохранить прогресс игры
     */
    private GameResultDto saveGame(int gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        // В реальности можно добавить логику автосохранения
        // или создание точки сохранения
        Game savedGame = gameRepository.save(game); // JPA автоматически сохраняет изменения

        return createResult(true, "Прогресс сохранен", null, game.isGame_over(), gameMapper.toDTO(savedGame));
    }
    private GameResultDto pauseGame(int gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        if (game.isGame_over()) {
            return createResult(false, "Нельзя приостановить завершенную игру", null, true, gameMapper.toDTO(game));
        }

        // Переключаем состояние паузы
        game.set_paused(!game.is_paused());
        Game savedGame = gameRepository.save(game);

        String message = game.is_paused() ? "Игра приостановлена" : "Игра возобновлена";
        return createResult(true, message, null, false, gameMapper.toDTO(savedGame));
    }
}
