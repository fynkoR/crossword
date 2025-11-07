package com.example.crossword.repository;

import com.example.crossword.enitity.Crossword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrosswordRepository extends JpaRepository<Crossword, Integer> {
    
    /**
     * Найти все кроссворды по ID словаря
     */
    List<Crossword> findByDictionaryId(Integer dictionaryId);
    
    /**
     * Получить количество кроссвордов в словаре
     */
    Long countByDictionaryId(Integer dictionaryId);
    
    /**
     * Поиск кроссвордов по подстроке в названии
     */
    List<Crossword> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Проверить существование кроссворда по названию
     */
    boolean existsByTitle(String title);
}
