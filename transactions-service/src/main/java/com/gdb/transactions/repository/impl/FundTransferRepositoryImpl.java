package com.gdb.transactions.repository.impl;

import com.gdb.transactions.domain.model.FundTransfer;
import com.gdb.transactions.repository.FundTransferRepository;
import com.gdb.transactions.repository.mapper.FundTransferRowMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * JDBC implementation of FundTransferRepository.
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class FundTransferRepositoryImpl implements FundTransferRepository {

    private final JdbcTemplate jdbcTemplate;
    private final FundTransferRowMapper rowMapper;

    @Override
    public FundTransfer save(FundTransfer fundTransfer) {
        if (fundTransfer.getId() == null) {
            return insert(fundTransfer);
        } else {
            return update(fundTransfer);
        }
    }

    private FundTransfer insert(FundTransfer fundTransfer) {
        String sql = """
            INSERT INTO fund_transfers (from_account, to_account, transfer_amount, transfer_mode)
            VALUES (?, ?, ?, ?)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, fundTransfer.getFromAccount());
            ps.setLong(2, fundTransfer.getToAccount());
            ps.setBigDecimal(3, fundTransfer.getTransferAmount());
            ps.setString(4, fundTransfer.getTransferMode().name());
            return ps;
        }, keyHolder);

        Long id = keyHolder.getKey().longValue();
        return findById(id).orElseThrow(() -> new RuntimeException("Failed to retrieve saved fund transfer"));
    }

    private FundTransfer update(FundTransfer fundTransfer) {
        String sql = """
            UPDATE fund_transfers 
            SET from_account = ?, to_account = ?, transfer_amount = ?, transfer_mode = ?
            WHERE id = ?
            """;

        jdbcTemplate.update(sql,
                fundTransfer.getFromAccount(),
                fundTransfer.getToAccount(),
                fundTransfer.getTransferAmount(),
                fundTransfer.getTransferMode().name(),
                fundTransfer.getId());

        return findById(fundTransfer.getId()).orElseThrow(() -> new RuntimeException("Failed to retrieve updated fund transfer"));
    }

    @Override
    public Optional<FundTransfer> findById(Long id) {
        String sql = """
            SELECT id, from_account, to_account, transfer_amount, transfer_mode, created_at, updated_at
            FROM fund_transfers
            WHERE id = ?
            """;

        List<FundTransfer> results = jdbcTemplate.query(sql, rowMapper, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public BigDecimal getDailyTransferAmount(Long accountNumber, LocalDate date) {
        String sql = """
            SELECT COALESCE(SUM(transfer_amount), 0)
            FROM fund_transfers
            WHERE from_account = ? AND DATE(created_at) = ?
            """;

        BigDecimal result = jdbcTemplate.queryForObject(sql, BigDecimal.class, accountNumber, date);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public Integer getDailyTransferCount(Long accountNumber, LocalDate date) {
        String sql = """
            SELECT COUNT(*)
            FROM fund_transfers
            WHERE from_account = ? AND DATE(created_at) = ?
            """;

        Integer result = jdbcTemplate.queryForObject(sql, Integer.class, accountNumber, date);
        return result != null ? result : 0;
    }

    @Override
    public List<FundTransfer> findByAccount(Long accountNumber, int limit, int offset) {
        String sql = """
            SELECT id, from_account, to_account, transfer_amount, transfer_mode, created_at, updated_at
            FROM fund_transfers
            WHERE from_account = ? OR to_account = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """;

        return jdbcTemplate.query(sql, rowMapper, accountNumber, accountNumber, limit, offset);
    }

    @Override
    public List<FundTransfer> findAll(int limit, int offset) {
        String sql = """
            SELECT id, from_account, to_account, transfer_amount, transfer_mode, created_at, updated_at
            FROM fund_transfers
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """;

        return jdbcTemplate.query(sql, rowMapper, limit, offset);
    }

    @Override
    public Long countAll() {
        String sql = "SELECT COUNT(*) FROM fund_transfers";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }
}