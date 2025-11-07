package com.example.crossword.repository;

import com.example.crossword.enitity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {
    List<Game> findByUserId(int userId);

    List<Game> findByCrosswordId(int crosswordId);

    @Query("SELECT g FROM Game g WHERE g.game_over = false")
    List<Game> findByGame_overFalse();

    @Query("SELECT g FROM Game g WHERE g.user.id = :userId AND g.game_over = :gameOver")
    List<Game> findByUserIdAndGame_over(@Param("userId") int userId, @Param("gameOver") boolean gameOver);

    @Query("SELECT g FROM Game g WHERE g.user.id = :userId AND g.crossword.id = :crosswordId AND g.game_over = false")
    Optional<Game> findByUserIdAndCrosswordIdAndGame_overFalse(@Param("userId") int userId, @Param("crosswordId") int crosswordId);

    @Query("SELECT CASE WHEN COUNT(g) > 0 THEN true ELSE false END FROM Game g WHERE g.user.id = :userId AND g.crossword.id = :crosswordId AND g.game_over = false")
    boolean existsByUserIdAndCrosswordIdAndGame_overFalse(@Param("userId") int userId, @Param("crosswordId") int crosswordId);
    
    /**
     * Получить количество игр по кроссворду
     */
    Long countByCrosswordId(Integer crosswordId);
    
    /**
     * Получить количество завершенных игр по кроссворду
     */
    @Query("SELECT COUNT(g) FROM Game g WHERE g.crossword.id = :crosswordId AND g.game_over = true")
    Long countByCrosswordIdAndGame_overTrue(@Param("crosswordId") Integer crosswordId);
}
