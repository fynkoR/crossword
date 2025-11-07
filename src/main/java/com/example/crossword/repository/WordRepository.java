package com.example.crossword.repository;

import com.example.crossword.enitity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Integer> {
    
    /**
     * Найти все слова по ID словаря
     */
    List<Word> findByDictionaryId(Integer dictionaryId);
    
    /**
     * Проверить существование слова в конкретном словаре
     */
    boolean existsByWordAndDictionaryId(String word, Integer dictionaryId);
    
    /**
     * Поиск слов по подстроке (игнорируя регистр)
     */
    List<Word> findByWordContainingIgnoreCase(String searchTerm);
    
    /**
     * Удалить все слова из словаря
     */
    void deleteByDictionaryId(Integer dictionaryId);
    
    /**
     * Получить количество слов в словаре
     */
    Long countByDictionaryId(Integer dictionaryId);
}
