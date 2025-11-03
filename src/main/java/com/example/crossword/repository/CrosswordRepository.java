package com.example.crossword.repository;

import com.example.crossword.enitity.Crossword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrosswordRepository extends JpaRepository<Crossword, Integer> {
}
