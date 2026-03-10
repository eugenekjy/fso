const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const blog = await Blog.findById(request.params.id);

    if (!blog) {
      return response.status(404).end();
    }

    if (blog.user.toString() !== request.user._id.toString()) {
      return response
        .status(401)
        .json({ error: 'You are not authorized to perform this action' });
    }

    await blog.deleteOne();

    response.status(204).end();
  },
);

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body;

  const user = request.user;

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' });
  }

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' });
  }

  const blog = new Blog({
    ...body,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;

  await Blog.findByIdAndDelete(id);
  response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
  const { likes } = request.body;

  let blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(404).end();
  }

  blog.likes = likes;

  await blog.save();
  response.send(blog);
});

module.exports = blogRouter;
