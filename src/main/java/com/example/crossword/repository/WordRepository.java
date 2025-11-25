package com.example.crossword.repository;

import com.example.crossword.enitity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {
    
    /**
     * Найти все слова по ID словаря
     */
    List<Word> findByDictionaryId(Long dictionaryId);
    
    /**
     * Найти все слова по ID словаря, отсортированные по алфавиту (А-Я)
     */
    @Query("SELECT w FROM Word w WHERE w.dictionary.id = :dictionaryId ORDER BY LOWER(w.word) ASC")
    List<Word> findByDictionaryIdOrderByWordAsc(@Param("dictionaryId") Long dictionaryId);
    
    /**
     * Найти все слова по ID словаря, отсортированные по алфавиту (Я-А)
     */
    @Query("SELECT w FROM Word w WHERE w.dictionary.id = :dictionaryId ORDER BY LOWER(w.word) DESC")
    List<Word> findByDictionaryIdOrderByWordDesc(@Param("dictionaryId") Long dictionaryId);
    
    /**
     * Найти все слова по ID словаря, отсортированные по длине (короткие сначала)
     */
    @Query("SELECT w FROM Word w WHERE w.dictionary.id = :dictionaryId ORDER BY LENGTH(w.word) ASC, LOWER(w.word) ASC")
    List<Word> findByDictionaryIdOrderByLengthAsc(@Param("dictionaryId") Long dictionaryId);
    
    /**
     * Найти все слова по ID словаря, отсортированные по длине (длинные сначала)
     */
    @Query("SELECT w FROM Word w WHERE w.dictionary.id = :dictionaryId ORDER BY LENGTH(w.word) DESC, LOWER(w.word) ASC")
    List<Word> findByDictionaryIdOrderByLengthDesc(@Param("dictionaryId") Long dictionaryId);
    
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
