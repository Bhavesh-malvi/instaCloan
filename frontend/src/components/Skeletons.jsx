import React from 'react';

export const PostSkeleton = () => {
  return (
    <div className="mb-6 border-b border-gray-200 pb-2 w-full animate-pulse">
      {/* Post Header Skeleton */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
      </div>
      
      {/* Post Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-gray-200 rounded-sm"></div>

      {/* Post Actions Skeleton */}
      <div className="flex items-center justify-between pt-3 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* Post Details Skeleton */}
      <div>
        <div className="w-16 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-full h-4 bg-gray-200 rounded mb-1"></div>
        <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
      </div>
    </div>
  );
};

export const ProfileHeaderSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center mb-10 pb-10 border-b border-gray-200 w-full gap-8 md:gap-[100px] animate-pulse">
      {/* Avatar */}
      <div className="flex justify-center flex-shrink-0 w-full md:w-auto mt-2 md:pl-10">
        <div className="w-[150px] h-[150px] rounded-full bg-gray-200"></div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 w-full mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="flex items-center gap-8 mb-5">
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-64 h-4 bg-gray-200 rounded mb-1"></div>
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const GridPostSkeleton = () => {
  return (
    <div className="aspect-square bg-gray-200 rounded-sm animate-pulse"></div>
  );
};

export const SearchUserSkeleton = () => {
  return (
    <div className="flex items-center justify-between w-full p-2 animate-pulse mb-2">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2">
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
          <div className="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
