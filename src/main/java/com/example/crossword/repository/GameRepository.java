package com.example.crossword.repository;

import com.example.crossword.enitity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByUserId(Long userId);

    List<Game> findByCrosswordId(Long crosswordId);

    @Query("SELECT g FROM Game g WHERE g.gameOver = false")
    List<Game> findByGame_overFalse();

    @Query("SELECT g FROM Game g WHERE g.user.id = :userId AND g.gameOver = :gameOver")
    List<Game> findByUserIdAndGame_over(@Param("userId") Long userId, @Param("gameOver") Boolean gameOver);

    @Query("SELECT g FROM Game g WHERE g.user.id = :userId AND g.crossword.id = :crosswordId AND g.gameOver = false")
    Optional<Game> findByUserIdAndCrosswordIdAndGame_overFalse(@Param("userId") Long userId, @Param("crosswordId") Long crosswordId);

    @Query("SELECT CASE WHEN COUNT(g) > 0 THEN true ELSE false END FROM Game g WHERE g.user.id = :userId AND g.crossword.id = :crosswordId AND g.gameOver = false")
    boolean existsByUserIdAndCrosswordIdAndGame_overFalse(@Param("userId") Long userId, @Param("crosswordId") Long crosswordId);
    
    /**
     * Получить количество игр по кроссворду
     */
    Long countByCrosswordId(Long crosswordId);
    
    /**
     * Получить количество завершенных игр по кроссворду
     */
    @Query("SELECT COUNT(g) FROM Game g WHERE g.crossword.id = :crosswordId AND g.gameOver = true")
    Long countByCrosswordIdAndGame_overTrue(@Param("crosswordId") Long crosswordId);
}
