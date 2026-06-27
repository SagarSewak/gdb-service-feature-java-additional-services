package com.gdb.bankstatements.service;

import com.gdb.bankstatements.domain.Statement;
import com.gdb.bankstatements.dto.StatementDto;
import com.gdb.bankstatements.repository.StatementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatementServiceImpl implements StatementService {

    private final StatementRepository statementRepository;

    @Override
    public StatementDto generateStatement(StatementDto request) {

        Statement statement = Statement.builder()
                .accountId(request.getAccountId())
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .format(request.getFormat())
                .status("COMPLETED")
                .downloadUrl("/downloads/" + UUID.randomUUID() + ".pdf")
                .build();

        statement = statementRepository.save(statement);

        return mapToDto(statement);
    }

    @Override
    public StatementDto getStatementStatus(String id) {

        Statement statement = statementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statement not found"));

        return mapToDto(statement);
    }

    @Override
    public String getDownloadUrl(String id) {

        Statement statement = statementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statement not found"));

        return statement.getDownloadUrl();
    }

    private StatementDto mapToDto(Statement statement) {

        StatementDto dto = new StatementDto();

        dto.setId(statement.getId());
        dto.setAccountId(statement.getAccountId());
        dto.setFromDate(statement.getFromDate());
        dto.setToDate(statement.getToDate());
        dto.setFormat(statement.getFormat());
        dto.setStatus(statement.getStatus());
        dto.setDownloadUrl(statement.getDownloadUrl());

        return dto;
    }
}
