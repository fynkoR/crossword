package com.example.crossword.service;

import com.example.crossword.dto.dtoCrossword.CrosswordGrid;
import com.example.crossword.dto.dtoCrossword.CrosswordWords;
import com.example.crossword.dto.dtoGame.GameActionDto;
import com.example.crossword.dto.dtoGame.GameDto;
import com.example.crossword.dto.dtoGame.GameResultDto;
import com.example.crossword.enitity.Crossword;
import com.example.crossword.enitity.Game;
import com.example.crossword.enitity.User;
import com.example.crossword.mapper.GameMapper;
import com.example.crossword.repository.CrosswordRepository;
import com.example.crossword.repository.GameRepository;
import com.example.crossword.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
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
    public GameResultDto handleAction(Long gameId, GameActionDto action) {
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
        Optional<Game> existingGame = gameRepository.findByUserIdAndCrosswordIdAndGame_overFalse(
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
        game.setGameOver(false);
        game.setSolved_words_count(0);

        Game savedGame = gameRepository.save(game);
        GameDto gameDTO = gameMapper.toDTO(savedGame);

        return createResult(true, "Игра начата!", null, false, gameDTO);
    }

    /**
     * Проверить ответ
     */
    private GameResultDto checkAnswer(Long gameId, GameActionDto action) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        if (game.getGameOver()) {
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
                game.setGameOver(true);
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
    private GameResultDto useHint(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        if (game.getGameOver()) {
            return createResult(false, "Игра уже завершена", null, true, gameMapper.toDTO(game));
        }

        // Проверяем, есть ли еще подсказки
        int remainingHints = calculateRemainingHints(game);
        if (remainingHints <= 0) {
            return createResult(false, "Подсказки закончились", null, false, gameMapper.toDTO(game));
        }

        CrosswordWords words = crosswordJsonService.parseWordsData(game.getCrossword().getWords_data());
        CrosswordGrid grid = crosswordJsonService.parseGridData(game.getCrossword().getGrid_data());
        
        // Получаем случайную букву для подсказки
        String hintData = getRandomHintLetter(words, grid);
        
        if (hintData == null || hintData.isEmpty()) {
            return createResult(false, "Нет доступных букв для подсказки", null, false, gameMapper.toDTO(game));
        }

        game.setHints_used(game.getHints_used() + 1);
        gameRepository.save(game);

        remainingHints = calculateRemainingHints(game);
        String message = "Подсказка использована. Осталось: " + remainingHints;

        return createResult(true, message, hintData, false, gameMapper.toDTO(game));
    }

    /**
     * Завершить игру
     */
    private GameResultDto completeGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        game.setGameOver(true);
        Game savedGame = gameRepository.save(game);

        return createResult(true, "Игра завершена", null, true, gameMapper.toDTO(savedGame));
    }

    /**
     * Вспомогательные методы
     */
    private String getRandomHintLetter(CrosswordWords words, CrosswordGrid grid) {
        // Собираем все незаполненные клетки (где letter == null)
        List<HintCell> availableCells = new java.util.ArrayList<>();
        
        for (CrosswordWords.CrosswordWord word : words.getWords()) {
            if (word.getPositions() != null && word.getPositions().size() >= 2) {
                String wordText = word.getText();
                for (int i = 0; i < word.getPositions().size(); i += 2) {
                    int x = word.getPositions().get(i);
                    int y = word.getPositions().get(i + 1);
                    
                    // Находим соответствующую клетку в сетке
                    CrosswordGrid.GridCell cell = findCell(grid, x, y);
                    if (cell != null && cell.getLetter() == null && !cell.getIsBlack()) {
                        // Клетка пустая, можно использовать для подсказки
                        int letterIndex = i / 2;
                        if (letterIndex < wordText.length()) {
                            char letter = wordText.charAt(letterIndex);
                            availableCells.add(new HintCell(x, y, letter));
                        }
                    }
                }
            }
        }
        
        if (availableCells.isEmpty()) {
            return null;
        }
        
        // Выбираем случайную клетку
        java.util.Random random = new java.util.Random();
        HintCell hintCell = availableCells.get(random.nextInt(availableCells.size()));
        
        // Возвращаем JSON с координатами и буквой: {"x":1,"y":2,"letter":"А"}
        return String.format("{\"x\":%d,\"y\":%d,\"letter\":\"%s\"}", 
                hintCell.x, hintCell.y, hintCell.letter);
    }
    
    private CrosswordGrid.GridCell findCell(CrosswordGrid grid, int x, int y) {
        if (grid.getCells() == null) {
            return null;
        }
        for (CrosswordGrid.GridCell cell : grid.getCells()) {
            if (cell.getX() != null && cell.getY() != null && 
                cell.getX().equals(x) && cell.getY().equals(y)) {
                return cell;
            }
        }
        return null;
    }
    
    private static class HintCell {
        int x, y;
        char letter;
        HintCell(int x, int y, char letter) {
            this.x = x;
            this.y = y;
            this.letter = letter;
        }
    }

    private int calculateRemainingHints(Game game) {
        Crossword crossword = game.getCrossword();
        int maxHints = crossword.getMax_hints() != null ? crossword.getMax_hints() : 0;
        int usedHints = game.getHints_used() != null ? game.getHints_used() : 0;
        return Math.max(0, maxHints - usedHints);
    }

    private boolean checkIfGameComplete(Game game, CrosswordWords words) {
        return game.getSolved_words_count() == words.getWords().size();
    }

    private GameResultDto createResult(Boolean success, String message, String data,
                                       Boolean gameComplete, GameDto game) {
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
    public GameDto getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));
        return gameMapper.toDTO(game);
    }

    public List<GameDto> getGamesByUser(Long userId) {
        List<Game> games = gameRepository.findByUserId(userId);
        return games.stream()
                .map(gameMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new RuntimeException("Игра не найдена");
        }
        gameRepository.deleteById(id);
    }

    /**
     * Начать игру заново
     */
    private GameResultDto restartGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        // Сбрасываем прогресс
        game.setHints_used(0);
        game.setSolved_words_count(0);
        game.setGameOver(false);

        Game restartedGame = gameRepository.save(game);

        return createResult(true, "Игра начата заново", null, false, gameMapper.toDTO(restartedGame));
    }

    /**
     * Сохранить прогресс игры
     */
    private GameResultDto saveGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        // В реальности можно добавить логику автосохранения
        // или создание точки сохранения
        Game savedGame = gameRepository.save(game); // JPA автоматически сохраняет изменения

        return createResult(true, "Прогресс сохранен", null, game.getGameOver(), gameMapper.toDTO(savedGame));
    }
    private GameResultDto pauseGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Игра не найдена"));

        if (game.getGameOver()) {
            return createResult(false, "Нельзя приостановить завершенную игру", null, true, gameMapper.toDTO(game));
        }

        // Переключаем состояние паузы
        game.setIsPaused(!game.getIsPaused());
        Game savedGame = gameRepository.save(game);

        String message = game.getIsPaused() ? "Игра приостановлена" : "Игра возобновлена";
        return createResult(true, message, null, false, gameMapper.toDTO(savedGame));
    }
}
