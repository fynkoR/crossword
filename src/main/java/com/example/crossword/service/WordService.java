package com.example.crossword.service;

import com.example.crossword.dtoWord.WordCreateDto;
import com.example.crossword.dtoWord.WordDto;
import com.example.crossword.dtoWord.WordUpdateDto;
import com.example.crossword.enitity.Dictionary;
import com.example.crossword.enitity.Word;
import com.example.crossword.mapper.WordMapper;
import com.example.crossword.repository.DictionaryRepository;
import com.example.crossword.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис для работы со словами
 */
@Service
@Transactional
public class WordService {
    
    private final WordRepository wordRepository;
    private final DictionaryRepository dictionaryRepository;
    private final WordMapper wordMapper;

    @Autowired
    public WordService(WordRepository wordRepository, 
                      DictionaryRepository dictionaryRepository,
                      WordMapper wordMapper) {
        this.wordRepository = wordRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.wordMapper = wordMapper;
    }

    /**
     * Создать новое слово
     */
    public WordDto createWord(WordCreateDto wordCreateDto) {
        // Проверяем существование словаря
        Dictionary dictionary = dictionaryRepository.findById(wordCreateDto.getDictionaryId())
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + wordCreateDto.getDictionaryId() + " не найден"));

        // Проверяем, не существует ли уже такое слово в этом словаре
        if (wordRepository.existsByWordAndDictionaryId(wordCreateDto.getWord(), wordCreateDto.getDictionaryId())) {
            throw new RuntimeException("Слово '" + wordCreateDto.getWord() + "' уже существует в этом словаре");
        }

        Word word = wordMapper.toEntity(wordCreateDto);
        word.setDictionary(dictionary);
        
        Word savedWord = wordRepository.save(word);
        return wordMapper.toDto(savedWord);
    }

    /**
     * Получить слово по ID
     */
    @Transactional(readOnly = true)
    public WordDto getWordById(Integer id) {
        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Слово с ID " + id + " не найдено"));
        return wordMapper.toDto(word);
    }

    /**
     * Получить все слова
     */
    @Transactional(readOnly = true)
    public List<WordDto> getAllWords() {
        return wordRepository.findAll().stream()
                .map(wordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Получить все слова из конкретного словаря
     */
    @Transactional(readOnly = true)
    public List<WordDto> getWordsByDictionaryId(Integer dictionaryId) {
        // Проверяем существование словаря
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }
        
        return wordRepository.findByDictionaryId(dictionaryId).stream()
                .map(wordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Поиск слов по подстроке
     */
    @Transactional(readOnly = true)
    public List<WordDto> searchWords(String searchTerm) {
        return wordRepository.findByWordContainingIgnoreCase(searchTerm).stream()
                .map(wordMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Обновить слово
     */
    public WordDto updateWord(Integer id, WordUpdateDto wordUpdateDto) {
        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Слово с ID " + id + " не найдено"));

        wordMapper.updateEntity(wordUpdateDto, word);
        Word updatedWord = wordRepository.save(word);
        
        return wordMapper.toDto(updatedWord);
    }

    /**
     * Удалить слово
     */
    public void deleteWord(Integer id) {
        if (!wordRepository.existsById(id)) {
            throw new RuntimeException("Слово с ID " + id + " не найдено");
        }
        wordRepository.deleteById(id);
    }

    /**
     * Удалить все слова из словаря
     */
    public void deleteWordsByDictionaryId(Integer dictionaryId) {
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }
        wordRepository.deleteByDictionaryId(dictionaryId);
    }

    /**
     * Получить количество слов в словаре
     */
    @Transactional(readOnly = true)
    public Long getWordCountByDictionary(Integer dictionaryId) {
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }
        return wordRepository.countByDictionaryId(dictionaryId);
    }
}

