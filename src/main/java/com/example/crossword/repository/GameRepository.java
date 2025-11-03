package com.example.crossword.repository;

import com.example.crossword.enitity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {
    List<Game> findByUserId(int userId);

    List<Game> findByCrosswordId(int crosswordId);

    List<Game> findByGameOverFalse();

    List<Game> findByUserIdAndGameOver(int userId, boolean gameOver);

    Optional<Game> findByUserIdAndCrosswordIdAndGameOverFalse(int userId, int crosswordId);

    boolean existsByUserIdAndCrosswordIdAndGameOverFalse(int userId, int crosswordId);
}
