package com.example.crossword.service;

import com.example.crossword.dto.dtoCrossword.*;
import com.example.crossword.enitity.Crossword;
import com.example.crossword.enitity.Dictionary;
import com.example.crossword.mapper.CrosswordMapper;
import com.example.crossword.repository.CrosswordRepository;
import com.example.crossword.repository.DictionaryRepository;
import com.example.crossword.repository.GameRepository;
import com.example.crossword.repository.UserRepository;
import com.example.crossword.repository.WordRepository;
import com.example.crossword.enitity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис для работы с кроссвордами
 */
@Service
@Transactional
public class CrosswordService {
    
    private final CrosswordRepository crosswordRepository;
    private final DictionaryRepository dictionaryRepository;
    private final GameRepository gameRepository;
    private final WordRepository wordRepository;
    private final UserRepository userRepository;
    private final CrosswordMapper crosswordMapper;
    private final CrosswordJsonService crosswordJsonService;
    private final CrosswordGeneratorService crosswordGeneratorService;

    @Autowired
    public CrosswordService(CrosswordRepository crosswordRepository,
                           DictionaryRepository dictionaryRepository,
                           GameRepository gameRepository,
                           WordRepository wordRepository,
                           UserRepository userRepository,
                           CrosswordMapper crosswordMapper,
                           CrosswordJsonService crosswordJsonService,
                           CrosswordGeneratorService crosswordGeneratorService) {
        this.crosswordRepository = crosswordRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.gameRepository = gameRepository;
        this.wordRepository = wordRepository;
        this.userRepository = userRepository;
        this.crosswordMapper = crosswordMapper;
        this.crosswordJsonService = crosswordJsonService;
        this.crosswordGeneratorService = crosswordGeneratorService;
    }

    /**
     * Создать новый кроссворд
     */
    public CrosswordDto createCrossword(CrosswordCreateDto crosswordCreateDto) {
        // Проверяем существование словаря
        Dictionary dictionary = dictionaryRepository.findById(crosswordCreateDto.getDictionaryId())
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + crosswordCreateDto.getDictionaryId() + " не найден"));

        // Проверяем, не существует ли кроссворд с таким названием
        if (crosswordRepository.existsByTitle(crosswordCreateDto.getTitle())) {
            throw new RuntimeException("Кроссворд с названием '" + crosswordCreateDto.getTitle() + "' уже существует");
        }

        // Валидация размеров сетки
        if (crosswordCreateDto.getGridWidth() < 5 || crosswordCreateDto.getGridWidth() > 50) {
            throw new RuntimeException("Ширина сетки должна быть от 5 до 50");
        }
        if (crosswordCreateDto.getGridHeight() < 5 || crosswordCreateDto.getGridHeight() > 50) {
            throw new RuntimeException("Высота сетки должна быть от 5 до 50");
        }

        Crossword crossword = crosswordMapper.toEntity(crosswordCreateDto);
        crossword.setDictionary(dictionary);
        
        // Сериализуем данные сетки и слов в JSON
        if (crosswordCreateDto.getGridData() != null) {
            String gridJson = crosswordJsonService.serializeGridData(crosswordCreateDto.getGridData());
            crossword.setGrid_data(gridJson);
        }
        
        if (crosswordCreateDto.getWordsData() != null) {
            String wordsJson = crosswordJsonService.serializeWordsData(crosswordCreateDto.getWordsData());
            crossword.setWords_data(wordsJson);
        }
        
        Crossword savedCrossword = crosswordRepository.save(crossword);
        return crosswordMapper.toDto(savedCrossword);
    }

    /**
     * Получить кроссворд по ID (базовая информация)
     */
    @Transactional(readOnly = true)
    public CrosswordDto getCrosswordById(Long id) {
        Crossword crossword = crosswordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Кроссворд с ID " + id + " не найден"));
        return crosswordMapper.toDto(crossword);
    }

    /**
     * Получить детальную информацию о кроссворде (включая сетку и слова)
     */
    @Transactional(readOnly = true)
    public CrosswordDetailDto getCrosswordDetailById(Long id) {
        Crossword crossword = crosswordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Кроссворд с ID " + id + " не найден"));
        
        CrosswordDetailDto detailDto = crosswordMapper.toDetailDto(crossword);
        
        // Десериализуем JSON данные
        if (crossword.getGrid_data() != null) {
            CrosswordGrid gridData = crosswordJsonService.parseGridData(crossword.getGrid_data());
            detailDto.setGridData(gridData);
        }
        
        if (crossword.getWords_data() != null) {
            CrosswordWords wordsData = crosswordJsonService.parseWordsData(crossword.getWords_data());
            detailDto.setWordsData(wordsData);
        }
        
        // Добавляем информацию о создателе
        if (crossword.getCreatedBy() != null) {
            detailDto.setCreatedByUserId(crossword.getCreatedBy().getId());
            detailDto.setCreatedByUserLogin(crossword.getCreatedBy().getLogin());
        }
        
        return detailDto;
    }

    /**
     * Получить все кроссворды
     */
    @Transactional(readOnly = true)
    public List<CrosswordDto> getAllCrosswords() {
        return crosswordRepository.findAll().stream()
                .map(crosswordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Получить все кроссворды из конкретного словаря
     */
    @Transactional(readOnly = true)
    public List<CrosswordDto> getCrosswordsByDictionaryId(Long dictionaryId) {
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }
        
        return crosswordRepository.findByDictionaryId(dictionaryId).stream()
                .map(crosswordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Поиск кроссвордов по названию
     */
    @Transactional(readOnly = true)
    public List<CrosswordDto> searchCrosswordsByTitle(String title) {
        return crosswordRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(crosswordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Обновить кроссворд
     */
    public CrosswordDto updateCrossword(Long id, CrosswordUpdateDto crosswordUpdateDto) {
        Crossword crossword = crosswordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Кроссворд с ID " + id + " не найден"));

        // Проверяем, не занято ли новое название другим кроссвордом
        if (!crossword.getTitle().equals(crosswordUpdateDto.getTitle()) &&
                crosswordRepository.existsByTitle(crosswordUpdateDto.getTitle())) {
            throw new RuntimeException("Кроссворд с названием '" + crosswordUpdateDto.getTitle() + "' уже существует");
        }

        // Валидация размеров сетки
        if (crosswordUpdateDto.getGridWidth() != null) {
            if (crosswordUpdateDto.getGridWidth() < 5 || crosswordUpdateDto.getGridWidth() > 50) {
                throw new RuntimeException("Ширина сетки должна быть от 5 до 50");
            }
        }
        if (crosswordUpdateDto.getGridHeight() != null) {
            if (crosswordUpdateDto.getGridHeight() < 5 || crosswordUpdateDto.getGridHeight() > 50) {
                throw new RuntimeException("Высота сетки должна быть от 5 до 50");
            }
        }

        crosswordMapper.updateEntity(crosswordUpdateDto, crossword);
        
        // Обновляем JSON данные если они предоставлены
        if (crosswordUpdateDto.getGridData() != null) {
            String gridJson = crosswordJsonService.serializeGridData(crosswordUpdateDto.getGridData());
            crossword.setGrid_data(gridJson);
        }
        
        if (crosswordUpdateDto.getWordsData() != null) {
            String wordsJson = crosswordJsonService.serializeWordsData(crosswordUpdateDto.getWordsData());
            crossword.setWords_data(wordsJson);
        }
        
        Crossword updatedCrossword = crosswordRepository.save(crossword);
        return crosswordMapper.toDto(updatedCrossword);
    }

    /**
     * Удалить кроссворд
     */
    public void deleteCrossword(Long id) {
        if (!crosswordRepository.existsById(id)) {
            throw new RuntimeException("Кроссворд с ID " + id + " не найден");
        }

        // Удаляем все связанные игры перед удалением кроссворда
        gameRepository.deleteByCrosswordId(id);

        crosswordRepository.deleteById(id);
    }

    /**
     * Получить статистику по кроссворду
     */
    @Transactional(readOnly = true)
    public CrosswordStatisticsDto getCrosswordStatistics(Long crosswordId) {
        if (!crosswordRepository.existsById(crosswordId)) {
            throw new RuntimeException("Кроссворд с ID " + crosswordId + " не найден");
        }

        Crossword crossword = crosswordRepository.findById(crosswordId).get();
        List<com.example.crossword.enitity.Game> allGames = gameRepository.findByCrosswordId(crosswordId);
        long gamesCount = allGames.size();
        long completedGamesCount = allGames.stream()
                .filter(g -> g.getGameOver() != null && g.getGameOver())
                .count();

        CrosswordStatisticsDto stats = new CrosswordStatisticsDto();
        stats.setCrosswordId(crosswordId);
        stats.setGamesCount(gamesCount);
        stats.setCompletedGamesCount(completedGamesCount);
        
        // Подсчитываем количество слов в кроссворде
        if (crossword.getWords_data() != null) {
            CrosswordWords wordsData = crosswordJsonService.parseWordsData(crossword.getWords_data());
            stats.setWordsCount((long) wordsData.getWords().size());
        } else {
            stats.setWordsCount(0L);
        }

        // Подсчитываем общее количество отгаданных букв из всех игр
        long totalGuessedLetters = 0;
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        for (com.example.crossword.enitity.Game game : allGames) {
            if (game.getGrid_state() != null && !game.getGrid_state().isEmpty()) {
                try {
                    // Парсим JSON массив grid_state
                    // grid_state хранится как JSON массив объектов {x, y, letter, isLocked}
                    java.util.List<java.util.Map<String, Object>> gridState = objectMapper.readValue(
                            game.getGrid_state(),
                            objectMapper.getTypeFactory().constructCollectionType(
                                    java.util.List.class,
                                    java.util.Map.class
                            )
                    );
                    // Считаем клетки с буквами (letter не null)
                    long guessedInGame = gridState.stream()
                            .filter(cell -> cell.containsKey("letter") && cell.get("letter") != null)
                            .count();
                    totalGuessedLetters += guessedInGame;
                } catch (Exception e) {
                    // Игнорируем ошибки парсинга
                }
            }
        }
        stats.setTotalGuessedLetters(totalGuessedLetters);

        return stats;
    }

    /**
     * Валидация кроссворда перед сохранением
     */
    public boolean validateCrossword(Long crosswordId) {
        Crossword crossword = crosswordRepository.findById(crosswordId)
                .orElseThrow(() -> new RuntimeException("Кроссворд с ID " + crosswordId + " не найден"));

        try {
            // Проверяем валидность JSON данных
            if (crossword.getGrid_data() != null) {
                crosswordJsonService.parseGridData(crossword.getGrid_data());
            }
            
            if (crossword.getWords_data() != null) {
                CrosswordWords wordsData = crosswordJsonService.parseWordsData(crossword.getWords_data());
                
                // Проверяем, что есть хотя бы одно слово
                if (wordsData.getWords().isEmpty()) {
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Генерировать кроссворд из словаря
     */
    public CrosswordDetailDto generateCrosswordFromDictionary(Long dictionaryId, int wordCount, String title, Integer maxHints, Long userId) {
        // Валидация названия кроссворда
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Название кроссворда обязательно");
        }
        // Применяем trim() к названию перед проверкой длины
        title = title.trim();
        if (title.length() < 4 || title.length() > 12) {
            throw new RuntimeException("Название кроссворда должно содержать от 4 до 12 символов");
        }
        
        // Проверяем существование словаря
        Dictionary dictionary = dictionaryRepository.findById(dictionaryId)
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + dictionaryId + " не найден"));

        // Генерируем кроссворд
        CrosswordGeneratorService.CrosswordGenerationResult result = 
                crosswordGeneratorService.generateCrossword(dictionaryId, wordCount);

        // Создаем кроссворд
        Crossword crossword = new Crossword();
        crossword.setTitle(title);
        crossword.setDictionary(dictionary);
        crossword.setGrid_width(result.getGrid().getSize().getWidth());
        crossword.setGrid_height(result.getGrid().getSize().getHeight());
        
        // Устанавливаем пользователя, который создал кроссворд
        if (userId != null) {
            User creator = userRepository.findById(userId)
                    .orElse(null);
            if (creator != null) {
                crossword.setCreatedBy(creator);
            }
        }
        
        // Устанавливаем максимальное количество подсказок (по умолчанию половина от количества слов)
        if (maxHints == null || maxHints < 0) {
            maxHints = Math.max(1, wordCount / 2); // минимум 1 подсказка
        }
        crossword.setMax_hints(maxHints);
        
        // Сериализуем данные
        String gridJson = crosswordJsonService.serializeGridData(result.getGrid());
        String wordsJson = crosswordJsonService.serializeWordsData(result.getWords());
        crossword.setGrid_data(gridJson);
        crossword.setWords_data(wordsJson);

        Crossword savedCrossword = crosswordRepository.save(crossword);
        
        // Возвращаем детальную информацию
        return getCrosswordDetailById(savedCrossword.getId());
    }

    /**
     * Создать кроссворд из выбранных слов (ручной режим)
     */
    public CrosswordDetailDto createManualCrossword(Long dictionaryId, List<Long> wordIds, String title, Integer maxHints, Long userId) {
        // Валидация названия кроссворда
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Название кроссворда обязательно");
        }
        // Применяем trim() к названию перед проверкой длины
        title = title.trim();
        if (title.length() < 4 || title.length() > 12) {
            throw new RuntimeException("Название кроссворда должно содержать от 4 до 12 символов");
        }
        
        // Проверяем существование словаря
        Dictionary dictionary = dictionaryRepository.findById(dictionaryId)
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + dictionaryId + " не найден"));

        // Получаем слова по ID
        List<com.example.crossword.enitity.Word> words = new java.util.ArrayList<>();
        for (Long wordId : wordIds) {
            com.example.crossword.enitity.Word word = wordRepository.findById(wordId)
                    .orElseThrow(() -> new RuntimeException("Слово с ID " + wordId + " не найдено"));
            words.add(word);
        }

        // Валидируем цепочку слов
        validateWordChain(words);

        // Генерируем сетку и размещаем слова
        CrosswordGeneratorService.CrosswordGenerationResult result = 
                crosswordGeneratorService.placeWordsInGrid(words);

        // Создаем кроссворд
        Crossword crossword = new Crossword();
        crossword.setTitle(title);
        crossword.setDictionary(dictionary);
        crossword.setGrid_width(result.getGrid().getSize().getWidth());
        crossword.setGrid_height(result.getGrid().getSize().getHeight());
        
        // Устанавливаем пользователя, который создал кроссворд
        if (userId != null) {
            User creator = userRepository.findById(userId)
                    .orElse(null);
            if (creator != null) {
                crossword.setCreatedBy(creator);
            }
        }
        
        // Устанавливаем максимальное количество подсказок (по умолчанию половина от количества слов)
        if (maxHints == null || maxHints < 0) {
            maxHints = Math.max(1, wordIds.size() / 2); // минимум 1 подсказка
        }
        crossword.setMax_hints(maxHints);
        
        // Сериализуем данные
        String gridJson = crosswordJsonService.serializeGridData(result.getGrid());
        String wordsJson = crosswordJsonService.serializeWordsData(result.getWords());
        crossword.setGrid_data(gridJson);
        crossword.setWords_data(wordsJson);

        Crossword savedCrossword = crosswordRepository.save(crossword);
        
        // Возвращаем детальную информацию
        return getCrosswordDetailById(savedCrossword.getId());
    }

    /**
     * Валидирует цепочку слов
     */
    private void validateWordChain(List<com.example.crossword.enitity.Word> words) {
        if (words.size() < 3) {
            throw new RuntimeException("Минимум 3 слова в цепочке");
        }
        if (words.size() > 10) {
            throw new RuntimeException("Максимум 10 слов в цепочке");
        }
        
        for (int i = 0; i < words.size() - 1; i++) {
            String currentWord = words.get(i).getWord().toLowerCase();
            String nextWord = words.get(i + 1).getWord().toLowerCase();
            char lastLetter = currentWord.charAt(currentWord.length() - 1);
            char firstLetter = nextWord.charAt(0);
            
            if (lastLetter != firstLetter) {
                throw new RuntimeException(
                    String.format("Слово '%s' должно начинаться с буквы '%c' (последняя буква слова '%s')",
                        words.get(i + 1).getWord(), Character.toUpperCase(lastLetter), words.get(i).getWord())
                );
            }
        }
    }

    /**
     * Проверить, какие варианты кроссворда доступны для словаря
     */
    public java.util.Map<Integer, Boolean> checkAvailableVariants(Long dictionaryId, int minWords, int maxWords) {
        // Проверяем существование словаря
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }

        java.util.Map<Integer, Boolean> variants = new java.util.HashMap<>();
        
        for (int wordCount = minWords; wordCount <= maxWords; wordCount++) {
            try {
                // Пробуем сгенерировать кроссворд
                crosswordGeneratorService.generateCrossword(dictionaryId, wordCount);
                variants.put(wordCount, true);
            } catch (RuntimeException e) {
                variants.put(wordCount, false);
            }
        }
        
        return variants;
    }

    /**
     * DTO для статистики кроссворда
     */
    public static class CrosswordStatisticsDto {
        private Long crosswordId;
        private Long gamesCount;
        private Long completedGamesCount;
        private Long wordsCount;
        private Long totalGuessedLetters; // Общее количество отгаданных букв во всех играх

        public Long getCrosswordId() {
            return crosswordId;
        }

        public void setCrosswordId(Long crosswordId) {
            this.crosswordId = crosswordId;
        }

        public Long getGamesCount() {
            return gamesCount;
        }

        public void setGamesCount(Long gamesCount) {
            this.gamesCount = gamesCount;
        }

        public Long getCompletedGamesCount() {
            return completedGamesCount;
        }

        public void setCompletedGamesCount(Long completedGamesCount) {
            this.completedGamesCount = completedGamesCount;
        }

        public Long getWordsCount() {
            return wordsCount;
        }

        public void setWordsCount(Long wordsCount) {
            this.wordsCount = wordsCount;
        }

        public Long getTotalGuessedLetters() {
            return totalGuessedLetters;
        }

        public void setTotalGuessedLetters(Long totalGuessedLetters) {
            this.totalGuessedLetters = totalGuessedLetters;
        }
    }
}

