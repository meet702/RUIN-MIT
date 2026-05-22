package com.RuinMIT.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ItemCondition {
    @JsonProperty("new")
    NEW,
    @JsonProperty("like_new")
    LIKE_NEW,
    @JsonProperty("good")
    GOOD,
    @JsonProperty("fair")
    FAIR
}
