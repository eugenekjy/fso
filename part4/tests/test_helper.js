const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Hello World 1',
    author: 'Eugene',
    url: 'test-url.com',
    likes: 2,
  },
  {
    title: 'Hello World 2',
    author: 'Eugene',
    url: 'testurl.com',
    likes: 3,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  blogsInDb,
};
