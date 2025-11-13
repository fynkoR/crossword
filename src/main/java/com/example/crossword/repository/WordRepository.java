package com.example.crossword.repository;

import com.example.crossword.enitity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {
    
    /**
     * Найти все слова по ID словаря
     */
    List<Word> findByDictionaryId(Long dictionaryId);
    
    /**
     * Проверить существование слова в конкретном словаре
     */
    boolean existsByWordAndDictionaryId(String word, Long dictionaryId);
    
    /**
     * Поиск слов по подстроке (игнорируя регистр)
     */
    List<Word> findByWordContainingIgnoreCase(String searchTerm);
    
    /**
     * Удалить все слова из словаря
     */
    void deleteByDictionaryId(Long dictionaryId);
    
    /**
     * Получить количество слов в словаре
     */
    Long countByDictionaryId(Long dictionaryId);
}
