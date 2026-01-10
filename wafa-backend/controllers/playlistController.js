import Playlist from "../models/playlistModel.js";
import asyncHandler from "../handlers/asyncHandler.js";

export const playlistController = {
  // Create new playlist
  create: asyncHandler(async (req, res) => {
    const { title, description, questionIds, moduleId, color } = req.body;
    const userId = req.user._id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const playlist = await Playlist.create({
      userId,
      title,
      description: description || "",
      questionIds: questionIds || [],
      moduleId: moduleId || null,
      color: color || "#667eea",
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist,
    });
  }),

  // Get all user's playlists
  getAll: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { moduleId } = req.query;

    const query = { userId };
    if (moduleId) query.moduleId = moduleId;

    const playlists = await Playlist.find(query)
      .populate("moduleId", "name")
      .populate("questionIds", "text")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: playlists,
    });
  }),

  // Get single playlist
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('=== GET PLAYLIST BY ID ===');
    console.log('Playlist ID:', id);
    console.log('User ID:', userId);

    const playlist = await Playlist.findOne({ _id: id, userId })
      .populate("moduleId", "name")
      .populate({
        path: "questionIds",
        select: "text options note images questionNumber sessionLabel"
      });

    console.log('Playlist found:', !!playlist);
    if (playlist) {
      console.log('Playlist title:', playlist.title);
      console.log('Questions count:', playlist.questionIds?.length);
    }

    if (!playlist) {
      console.log('Playlist not found - returning 404');
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Format response to match ExamPage expectations
    const formattedPlaylist = {
      _id: playlist._id,
      name: playlist.title,
      title: playlist.title,
      description: playlist.description,
      moduleId: playlist.moduleId,
      color: playlist.color,
      questions: playlist.questionIds || [],
      totalQuestions: playlist.questionIds?.length || 0,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    };

    console.log('Formatted playlist:', formattedPlaylist);
    console.log('Returning success response');

    res.status(200).json({
      success: true,
      data: formattedPlaylist,
    });
  }),

  // Update playlist
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, description, questionIds, moduleId, color, isPublic } =
      req.body;

    const playlist = await Playlist.findOne({ _id: id, userId });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (title) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (questionIds) playlist.questionIds = questionIds;
    if (moduleId !== undefined) playlist.moduleId = moduleId;
    if (color) playlist.color = color;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: playlist,
    });
  }),

  // Add question to playlist
  addQuestion: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { questionId } = req.body;
    const userId = req.user._id;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required",
      });
    }

    const playlist = await Playlist.findOne({ _id: id, userId });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (playlist.questionIds.includes(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Question already in playlist",
      });
    }

    playlist.questionIds.push(questionId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Question added to playlist",
      data: playlist,
    });
  }),

  // Remove question from playlist
  removeQuestion: asyncHandler(async (req, res) => {
    const { id, questionId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findOne({ _id: id, userId });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    playlist.questionIds = playlist.questionIds.filter(
      (qId) => qId.toString() !== questionId
    );
    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Question removed from playlist",
      data: playlist,
    });
  }),

  // Delete playlist
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findOneAndDelete({ _id: id, userId });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  }),
};
