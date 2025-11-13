package com.example.crossword.repository;

import com.example.crossword.enitity.Dictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DictionaryRepository extends JpaRepository<Dictionary, Long> {
    
    /**
     * Проверить существование словаря по названию
     */
    boolean existsByTitle(String title);
    
    /**
     * Поиск словарей по подстроке в названии
     */
    List<Dictionary> findByTitleContainingIgnoreCase(String title);
}
