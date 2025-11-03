package com.example.crossword.enitity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "dictionaries")
public class Dictionary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String title;
    private String description;
    @OneToMany(mappedBy = "dictionary", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Crossword> crosswords;
    @OneToMany(mappedBy = "dictionary", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Word> words;
}
