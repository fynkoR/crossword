package com.example.crossword.service;

import com.example.crossword.dto.dtoDictionary.DictionaryDto;
import com.example.crossword.dto.dtoWord.WordDto;
import com.example.crossword.enitity.Dictionary;
import com.example.crossword.mapper.DictionaryMapper;
import com.example.crossword.mapper.WordMapper;
import com.example.crossword.repository.CrosswordRepository;
import com.example.crossword.repository.DictionaryRepository;
import com.example.crossword.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис для работы со словарями
 */
@Service
@Transactional
public class DictionaryService {
    
    private final DictionaryRepository dictionaryRepository;
    private final WordRepository wordRepository;
    private final CrosswordRepository crosswordRepository;
    private final DictionaryMapper dictionaryMapper;
    private final WordMapper wordMapper;

    @Autowired
    public DictionaryService(DictionaryRepository dictionaryRepository,
                           WordRepository wordRepository,
                           CrosswordRepository crosswordRepository,
                           DictionaryMapper dictionaryMapper,
                           WordMapper wordMapper) {
        this.dictionaryRepository = dictionaryRepository;
        this.wordRepository = wordRepository;
        this.crosswordRepository = crosswordRepository;
        this.dictionaryMapper = dictionaryMapper;
        this.wordMapper = wordMapper;
    }

    /**
     * Создать новый словарь
     */
    public DictionaryDto createDictionary(DictionaryDto dictionaryDto) {
        // Проверяем, не существует ли словарь с таким названием
        if (dictionaryRepository.existsByTitle(dictionaryDto.getTitle())) {
            throw new RuntimeException("Словарь с названием '" + dictionaryDto.getTitle() + "' уже существует");
        }

        Dictionary dictionary = dictionaryMapper.toEntity(dictionaryDto);
        Dictionary savedDictionary = dictionaryRepository.save(dictionary);
        
        return dictionaryMapper.toDto(savedDictionary);
    }

    /**
     * Получить словарь по ID
     */
    @Transactional(readOnly = true)
    public DictionaryDto getDictionaryById(Long id) {
        Dictionary dictionary = dictionaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + id + " не найден"));
        return dictionaryMapper.toDto(dictionary);
    }

    /**
     * Получить все словари
     */
    @Transactional(readOnly = true)
    public List<DictionaryDto> getAllDictionaries() {
        return dictionaryRepository.findAll().stream()
                .map(dictionaryMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Поиск словарей по названию
     */
    @Transactional(readOnly = true)
    public List<DictionaryDto> searchDictionariesByTitle(String title) {
        return dictionaryRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(dictionaryMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Обновить словарь
     */
    public DictionaryDto updateDictionary(Long id, DictionaryDto dictionaryDto) {
        Dictionary dictionary = dictionaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + id + " не найден"));

        // Проверяем, не занято ли новое название другим словарем
        if (!dictionary.getTitle().equals(dictionaryDto.getTitle()) &&
                dictionaryRepository.existsByTitle(dictionaryDto.getTitle())) {
            throw new RuntimeException("Словарь с названием '" + dictionaryDto.getTitle() + "' уже существует");
        }

        dictionaryMapper.updateEntity(dictionaryDto, dictionary);
        Dictionary updatedDictionary = dictionaryRepository.save(dictionary);
        
        return dictionaryMapper.toDto(updatedDictionary);
    }

    /**
     * Удалить словарь
     * При удалении словаря также удаляются все связанные слова и кроссворды
     */
    public void deleteDictionary(Long id) {
        if (!dictionaryRepository.existsById(id)) {
            throw new RuntimeException("Словарь с ID " + id + " не найден");
        }

        // Проверяем, есть ли связанные кроссворды
        long crosswordCount = crosswordRepository.countByDictionaryId(id);
        if (crosswordCount > 0) {
            throw new RuntimeException("Невозможно удалить словарь: существует " + crosswordCount + 
                    " связанных кроссвордов. Удалите сначала все кроссворды.");
        }

        dictionaryRepository.deleteById(id);
    }

    /**
     * Получить все слова из словаря
     */
    @Transactional(readOnly = true)
    public List<WordDto> getWordsFromDictionary(Long dictionaryId) {
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }

        return wordRepository.findByDictionaryId(dictionaryId).stream()
                .map(wordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Получить статистику по словарю
     */
    @Transactional(readOnly = true)
    public DictionaryStatisticsDto getDictionaryStatistics(Long dictionaryId) {
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }

        long wordsCount = wordRepository.countByDictionaryId(dictionaryId);
        long crosswordsCount = crosswordRepository.countByDictionaryId(dictionaryId);

        DictionaryStatisticsDto stats = new DictionaryStatisticsDto();
        stats.setDictionaryId(dictionaryId);
        stats.setWordsCount(wordsCount);
        stats.setCrosswordsCount(crosswordsCount);

        return stats;
    }

    /**
     * DTO для статистики словаря
     */
    public static class DictionaryStatisticsDto {
        private Long dictionaryId;
        private Long wordsCount;
        private Long crosswordsCount;

        public Long getDictionaryId() {
            return dictionaryId;
        }

        public void setDictionaryId(Long dictionaryId) {
            this.dictionaryId = dictionaryId;
        }

        public Long getWordsCount() {
            return wordsCount;
        }

        public void setWordsCount(Long wordsCount) {
            this.wordsCount = wordsCount;
        }

        public Long getCrosswordsCount() {
            return crosswordsCount;
        }

        public void setCrosswordsCount(Long crosswordsCount) {
            this.crosswordsCount = crosswordsCount;
        }
    }
}

