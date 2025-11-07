package com.example.crossword.service;

import com.example.crossword.dtoCrossword.*;
import com.example.crossword.enitity.Crossword;
import com.example.crossword.enitity.Dictionary;
import com.example.crossword.mapper.CrosswordMapper;
import com.example.crossword.repository.CrosswordRepository;
import com.example.crossword.repository.DictionaryRepository;
import com.example.crossword.repository.GameRepository;
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
    private final CrosswordMapper crosswordMapper;
    private final CrosswordJsonService crosswordJsonService;

    @Autowired
    public CrosswordService(CrosswordRepository crosswordRepository,
                           DictionaryRepository dictionaryRepository,
                           GameRepository gameRepository,
                           CrosswordMapper crosswordMapper,
                           CrosswordJsonService crosswordJsonService) {
        this.crosswordRepository = crosswordRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.gameRepository = gameRepository;
        this.crosswordMapper = crosswordMapper;
        this.crosswordJsonService = crosswordJsonService;
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
    public CrosswordDto getCrosswordById(Integer id) {
        Crossword crossword = crosswordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Кроссворд с ID " + id + " не найден"));
        return crosswordMapper.toDto(crossword);
    }

    /**
     * Получить детальную информацию о кроссворде (включая сетку и слова)
     */
    @Transactional(readOnly = true)
    public CrosswordDetailDto getCrosswordDetailById(Integer id) {
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
    public List<CrosswordDto> getCrosswordsByDictionaryId(Integer dictionaryId) {
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
    public CrosswordDto updateCrossword(Integer id, CrosswordUpdateDto crosswordUpdateDto) {
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
    public void deleteCrossword(Integer id) {
        if (!crosswordRepository.existsById(id)) {
            throw new RuntimeException("Кроссворд с ID " + id + " не найден");
        }

        // Проверяем, есть ли связанные игры
        long gamesCount = gameRepository.countByCrosswordId(id);
        if (gamesCount > 0) {
            throw new RuntimeException("Невозможно удалить кроссворд: существует " + gamesCount + 
                    " связанных игр. Удалите сначала все игры.");
        }

        crosswordRepository.deleteById(id);
    }

    /**
     * Получить статистику по кроссворду
     */
    @Transactional(readOnly = true)
    public CrosswordStatisticsDto getCrosswordStatistics(Integer crosswordId) {
        if (!crosswordRepository.existsById(crosswordId)) {
            throw new RuntimeException("Кроссворд с ID " + crosswordId + " не найден");
        }

        Crossword crossword = crosswordRepository.findById(crosswordId).get();
        long gamesCount = gameRepository.countByCrosswordId(crosswordId);
        long completedGamesCount = gameRepository.countByCrosswordIdAndGameOverTrue(crosswordId);

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

        return stats;
    }

    /**
     * Валидация кроссворда перед сохранением
     */
    public boolean validateCrossword(Integer crosswordId) {
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
     * DTO для статистики кроссворда
     */
    public static class CrosswordStatisticsDto {
        private Integer crosswordId;
        private Long gamesCount;
        private Long completedGamesCount;
        private Long wordsCount;

        public Integer getCrosswordId() {
            return crosswordId;
        }

        public void setCrosswordId(Integer crosswordId) {
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
    }
}

