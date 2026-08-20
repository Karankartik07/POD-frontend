"use client";

import React from "react";

import "./BlogList.css";

import BlogData from "../../../Data/BlogData";
import Link from "next/link";

const BlogList = () => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div className="blogListSection">
        <div className="blogListHeaderContainer">
          <div className="blogListHeader">
            <h2>The Blog</h2>
            <div className="blogListHeaderCategories">
              <p>ALL</p>
              <p>COMPANY</p>
              <p className="activeCategory">FASHION</p>
              <p>STYLE</p>
              <p>TRENDS</p>
              <p>BEAUTY</p>
            </div>
          </div>
        </div>
        <div className="blogPostListContainer">
          {BlogData.map((blogPost) => (
            <div className="blogPost" key={blogPost.blogID}>
              <div className="blogPostThumb">
                <img src={blogPost.blogThumbnail?.src || blogPost.blogThumbnail} alt="blogPost" />
              </div>
              <div className="blogPostContent">
                <div className="blogPostContentDate">
                  <p>by admin</p>
                  <p>{blogPost.blogDate}</p>
                </div>
                <div className="blogPostContentHeading">
                  <Link href="/blog-details" onClick={scrollToTop}>
                    {blogPost.blogHeading}
                  </Link>
                </div>
                <div className="blogPostContentDescription">
                  <p>
                    Midst one brought greater also morning green saying had
                    good. Open stars day let over gathered, grass face one every
                    light of under.
                  </p>
                </div>
                <div className="blogPostContentReadMore">
                  <Link href="/blog-details" onClick={scrollToTop}>
                    Continue Reading
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="blogListShowMore" onClick={scrollToTop}>
          Show More
        </p>
      </div>
    </>
  );
};

export default BlogList;
