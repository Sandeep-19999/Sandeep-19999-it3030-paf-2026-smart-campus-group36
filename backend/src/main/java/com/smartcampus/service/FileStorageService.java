package com.smartcampus.service;

import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketAttachment;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload-dir}") String uploadDir) throws IOException {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadRoot);
    }

    public List<TicketAttachment> storeTicketFiles(Ticket ticket, User uploadedBy, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("Please attach at least one image file");
        }

        List<TicketAttachment> attachments = new ArrayList<>();
        Path ticketDir = uploadRoot.resolve("tickets").resolve(String.valueOf(ticket.getId()));
        try {
            Files.createDirectories(ticketDir);
            for (MultipartFile file : files) {
                validateImageFile(file);
                String original = StringUtils.cleanPath(file.getOriginalFilename());
                String stored = UUID.randomUUID() + "_" + original.replaceAll("\s+", "_");
                Path target = ticketDir.resolve(stored);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicket(ticket);
                attachment.setUploadedBy(uploadedBy);
                attachment.setOriginalFileName(original);
                attachment.setStoredFileName(stored);
                attachment.setContentType(file.getContentType());
                attachment.setFilePath(target.toString());
                attachments.add(attachment);
            }
        } catch (IOException ex) {
            throw new BadRequestException("File upload failed: " + ex.getMessage());
        }
        return attachments;
    }

    public Resource loadAsResource(String path) {
        return new PathResource(Path.of(path));
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Only image attachments are allowed");
        }
        if (file.isEmpty()) {
            throw new BadRequestException("Empty files cannot be uploaded");
        }
    }
}
