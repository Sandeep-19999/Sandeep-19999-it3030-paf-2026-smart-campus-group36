package com.smartcampus.service;

import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketAttachment;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
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
import java.util.stream.Stream;

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

    public String storeUserAvatar(User user, MultipartFile file) {
        validateImageFile(file);

        Path avatarDir = uploadRoot.resolve("avatars").resolve(String.valueOf(user.getId()));
        try {
            Files.createDirectories(avatarDir);
            clearDirectory(avatarDir);

            String extension = getSafeImageExtension(file.getOriginalFilename(), file.getContentType());
            String storedFileName = "avatar" + extension;
            Path target = avatarDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/api/auth/avatar/" + user.getId() + "?v=" + System.currentTimeMillis();
        } catch (IOException ex) {
            throw new BadRequestException("Profile picture upload failed: " + ex.getMessage());
        }
    }

    public Resource loadUserAvatarAsResource(Long userId) {
        Path avatarFile = resolveAvatarFile(userId);
        return new PathResource(avatarFile);
    }

    public String getUserAvatarContentType(Long userId) {
        Path avatarFile = resolveAvatarFile(userId);
        try {
            String contentType = Files.probeContentType(avatarFile);
            if (contentType == null || contentType.isBlank()) {
                return "application/octet-stream";
            }
            return contentType;
        } catch (IOException ex) {
            return "application/octet-stream";
        }
    }

    public Resource loadAsResource(String path) {
        return new PathResource(Path.of(path));
    }

    private Path resolveAvatarFile(Long userId) {
        Path avatarDir = uploadRoot.resolve("avatars").resolve(String.valueOf(userId));
        if (!Files.exists(avatarDir) || !Files.isDirectory(avatarDir)) {
            throw new ResourceNotFoundException("Profile picture not found");
        }
        try (Stream<Path> fileStream = Files.list(avatarDir)) {
            return fileStream
                    .filter(Files::isRegularFile)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Profile picture not found"));
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read profile picture");
        }
    }

    private String getSafeImageExtension(String originalFilename, String contentType) {
        String extension = StringUtils.getFilenameExtension(StringUtils.cleanPath(originalFilename == null ? "" : originalFilename));
        if (extension != null) {
            String normalized = extension.trim().toLowerCase();
            if (normalized.matches("jpg|jpeg|png|gif|webp")) {
                return "." + normalized;
            }
        }
        if (contentType != null) {
            String normalizedContentType = contentType.toLowerCase();
            if (normalizedContentType.contains("jpeg") || normalizedContentType.contains("jpg")) return ".jpg";
            if (normalizedContentType.contains("png")) return ".png";
            if (normalizedContentType.contains("gif")) return ".gif";
            if (normalizedContentType.contains("webp")) return ".webp";
        }
        return ".png";
    }

    private void clearDirectory(Path dir) throws IOException {
        if (!Files.exists(dir)) return;
        try (Stream<Path> fileStream = Files.list(dir)) {
            fileStream.filter(Files::isRegularFile).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ex) {
                    throw new BadRequestException("Failed to replace profile picture");
                }
            });
        }
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
