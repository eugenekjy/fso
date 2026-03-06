const _ = require('lodash');

const dummy = () => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => {
    return totalLikes + blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  return blogs.reduce((favorite, nextBlog) => {
    if (nextBlog.likes > favorite.likes) {
      return nextBlog;
    }
    return favorite;
  }, blogs[0]);
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;
  const result = _(blogs)
    .countBy('author')
    .map((blogs, author) => ({ author, blogs }))
    .maxBy('blogs');

  return result;
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const result = _(blogs)
    .groupBy('author')
    .map((authorBlogs, author) => ({
      author,
      likes: _.sumBy(authorBlogs, 'likes'),
    }))
    .maxBy('likes');

  return result;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
