package com.example.crossword.service;

import com.example.crossword.dto.dtoDictionary.DictionaryDto;
import com.example.crossword.dto.dtoDictionary.DictionaryImportResultDto;
import com.example.crossword.dto.dtoWord.WordDto;
import com.example.crossword.enitity.Dictionary;
import com.example.crossword.enitity.Word;
import com.example.crossword.mapper.DictionaryMapper;
import com.example.crossword.mapper.WordMapper;
import com.example.crossword.repository.CrosswordRepository;
import com.example.crossword.repository.DictionaryRepository;
import com.example.crossword.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
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
    private final com.example.crossword.repository.GameRepository gameRepository;
    private final DictionaryMapper dictionaryMapper;
    private final WordMapper wordMapper;

    @Autowired
    public DictionaryService(DictionaryRepository dictionaryRepository,
                           WordRepository wordRepository,
                           CrosswordRepository crosswordRepository,
                           com.example.crossword.repository.GameRepository gameRepository,
                           DictionaryMapper dictionaryMapper,
                           WordMapper wordMapper) {
        this.dictionaryRepository = dictionaryRepository;
        this.wordRepository = wordRepository;
        this.crosswordRepository = crosswordRepository;
        this.gameRepository = gameRepository;
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
     * При удалении словаря также удаляются все связанные слова и кроссворды (каскадное удаление)
     */
    public void deleteDictionary(Long id) {
        if (!dictionaryRepository.existsById(id)) {
            throw new RuntimeException("Словарь с ID " + id + " не найден");
        }

        // Получаем количество связанных кроссвордов для информации
        long crosswordCount = crosswordRepository.countByDictionaryId(id);
        
        if (crosswordCount > 0) {
            // Удаляем все связанные кроссворды
            List<com.example.crossword.enitity.Crossword> crosswords = crosswordRepository.findByDictionaryId(id);
            
            for (com.example.crossword.enitity.Crossword crossword : crosswords) {
                // Сначала удаляем все игры, связанные с этим кроссвордом
                gameRepository.deleteByCrosswordId(crossword.getId());
                // Затем удаляем сам кроссворд
                crosswordRepository.deleteById(crossword.getId());
            }
            
            System.out.println("Удалено кроссвордов: " + crosswordCount);
        }

        // Удаляем словарь (слова удалятся автоматически через каскад)
        dictionaryRepository.deleteById(id);
    }

    /**
     * Получить все слова из словаря
     * @param dictionaryId ID словаря
     * @param sortBy тип сортировки: "alphabet-asc", "alphabet-desc", "length-asc", "length-desc" или null (без сортировки)
     */
    @Transactional(readOnly = true)
    public List<WordDto> getWordsFromDictionary(Long dictionaryId, String sortBy) {
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }

        List<Word> words;
        
        if (sortBy == null || sortBy.isEmpty()) {
            // Без сортировки
            words = wordRepository.findByDictionaryId(dictionaryId);
        } else {
            switch (sortBy) {
                case "alphabet-asc":
                    words = wordRepository.findByDictionaryIdOrderByWordAsc(dictionaryId);
                    break;
                case "alphabet-desc":
                    words = wordRepository.findByDictionaryIdOrderByWordDesc(dictionaryId);
                    break;
                case "length-asc":
                    words = wordRepository.findByDictionaryIdOrderByLengthAsc(dictionaryId);
                    break;
                case "length-desc":
                    words = wordRepository.findByDictionaryIdOrderByLengthDesc(dictionaryId);
                    break;
                default:
                    // По умолчанию без сортировки
                    words = wordRepository.findByDictionaryId(dictionaryId);
                    break;
            }
        }

        return words.stream()
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
     * Импорт словаря из текстового файла
     * Формат файла: каждая строка содержит слово и определение, разделённые символом '|'
     * Пример: слово|определение
     * 
     * @param file загруженный файл
     * @param dictionaryId ID словаря, в который импортировать слова
     * @param skipDuplicates если true, дубликаты будут пропущены, иначе будет ошибка
     * @return результат импорта
     */
    @Transactional
    public DictionaryImportResultDto importDictionaryFromFile(MultipartFile file, Long dictionaryId, boolean skipDuplicates) {
        // Проверяем существование словаря
        Dictionary dictionary = dictionaryRepository.findById(dictionaryId)
                .orElseThrow(() -> new RuntimeException("Словарь с ID " + dictionaryId + " не найден"));

        DictionaryImportResultDto result = new DictionaryImportResultDto();
        result.setDictionaryId(dictionaryId);
        result.setDictionaryTitle(dictionary.getTitle());

        int totalLines = 0;
        int successfullyImported = 0;
        int skipped = 0;
        int failed = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String line;
            int lineNumber = 0;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                line = line.trim();
                
                // Пропускаем пустые строки
                if (line.isEmpty()) {
                    continue;
                }
                
                totalLines++;
                
                // Парсим строку
                String[] parts = line.split("\\|", 2);
                
                if (parts.length < 1) {
                    failed++;
                    continue;
                }
                
                String wordText = parts[0].trim();
                String definition = parts.length > 1 ? parts[1].trim() : "";
                
                if (wordText.isEmpty()) {
                    failed++;
                    continue;
                }
                
                // Проверяем на дубликаты
                if (wordRepository.existsByWordAndDictionaryId(wordText, dictionaryId)) {
                    if (skipDuplicates) {
                        skipped++;
                        continue;
                    } else {
                        throw new RuntimeException("Слово '" + wordText + "' уже существует в словаре (строка " + lineNumber + ")");
                    }
                }
                
                // Создаём и сохраняем слово
                try {
                    Word word = new Word();
                    word.setWord(wordText);
                    word.setDefinition(definition);
                    word.setDictionary(dictionary);
                    wordRepository.save(word);
                    successfullyImported++;
                } catch (Exception e) {
                    failed++;
                }
            }
            
            result.setTotalLines(totalLines);
            result.setSuccessfullyImported(successfullyImported);
            result.setSkipped(skipped);
            result.setFailed(failed);
            result.setMessage("Импорт завершён успешно");
            
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при чтении файла: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * Экспорт словаря в текстовый файл
     * Формат: слово|определение (каждая пара на новой строке)
     * 
     * @param dictionaryId ID словаря для экспорта
     * @return содержимое файла в виде строки
     */
    @Transactional(readOnly = true)
    public String exportDictionaryToFile(Long dictionaryId) {
        // Проверяем существование словаря
        if (!dictionaryRepository.existsById(dictionaryId)) {
            throw new RuntimeException("Словарь с ID " + dictionaryId + " не найден");
        }

        // Получаем все слова из словаря
        List<Word> words = wordRepository.findByDictionaryId(dictionaryId);
        
        if (words.isEmpty()) {
            throw new RuntimeException("Словарь пустой, нечего экспортировать");
        }

        StringBuilder sb = new StringBuilder();
        
        for (Word word : words) {
            sb.append(word.getWord());
            if (word.getDefinition() != null && !word.getDefinition().isEmpty()) {
                sb.append("|").append(word.getDefinition());
            }
            sb.append("\n");
        }
        
        return sb.toString();
    }

    /**
     * Экспорт словаря в байты для скачивания файла
     * 
     * @param dictionaryId ID словаря для экспорта
     * @return байты файла в кодировке UTF-8
     */
    @Transactional(readOnly = true)
    public byte[] exportDictionaryToBytes(Long dictionaryId) {
        String content = exportDictionaryToFile(dictionaryId);
        return content.getBytes(StandardCharsets.UTF_8);
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

