﻿using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Nest;
using ShopRe.Common.DTOs;
using ShopRe.Common.RequestFeatures;
using ShopRe.Data;
using ShopRe.Model.Models;
using static ShopRe.Service.ElasticSearchsService;

namespace ShopRe.Service
{
    public interface IElasticSearchService
    {
        Task<(List<Product> Products, int TotalCount, List<Brand> brands, List<Category> categories)> GetAllAsync(ProductParameters productParameters);
        Task<IEnumerable<Product>> GetByIdAsync(int id);
        Task<(List<dynamic> Products, int TotalCount, List<Brand> brands, List<Category> categories)> ProductAfterTraining(ProductParameters productParameters);
        Task<List<BrandDetailDTO>> GetBrands();
        Task<List<DetailCommentDTO>> DetailComments(CommentParameters commentParameters, int ProductId);
        Task<CommentsRatingCountDTO> CommentsRatingCount(int idProduct);
        Task<SellerDTO> GetLastestProductsOfSellerById(SellerParameters sellerParameters, int id);
        Task<SellerDTO> GetTopQuantitySoldProductsOfSellerById(SellerParameters sellerParameters, int id);
        Task<SellerDTO> GetProductsBySeller(SellerParameters sellerParameters, int id);
    }
    public class ElasticSearchsService : IElasticSearchService
    {
        private readonly IElasticClient _elasticClient;

        private readonly ShopRecommenderSystemDbContext _dbContext;
        private readonly IMapper _mapper;

        public ElasticSearchsService(IElasticClient elasticClient, ShopRecommenderSystemDbContext dbContext,
            IMapper mapper)
        {
            _mapper = mapper;
            _dbContext = dbContext;
            _elasticClient = elasticClient;
        }

        public class ProductResponse
        {
            public List<Product> Products { get; set; }
            public int TotalCount { get; set; }
        }

        //Covert
        private List<Product> ConvertToProduct(List<object> documents)
        {
            var products = new List<Product>();
            foreach (dynamic document in documents)
            {
                var product = new Product
                {
                    ID_NK = document.ContainsKey("ID_NK") ? Convert.ToInt32(document["ID_NK"]) : 0,
                    ID_SK = document.ContainsKey("ID_SK") ? Convert.ToInt32(document["ID_SK"]) : 0,
                    Name = document.ContainsKey("Name") ? document["Name"].ToString() : "",
                    Description = document.ContainsKey("Description") ? document["Description"].ToString() : "",
                    ShortDescription = document.ContainsKey("ShortDescription") ? document["ShortDescription"].ToString() : "",
                    Image = document.ContainsKey("Image") ? document["Image"].ToString() : "",
                    Price = document.ContainsKey("Price") ? Convert.ToDecimal(document["Price"]) : 0,
                    ListPrice = document.ContainsKey("ListPrice") ? Convert.ToDecimal(document["ListPrice"]) : 0,
                    OriginalPrice = document.ContainsKey("OriginalPrice") ? Convert.ToDecimal(document["OriginalPrice"]) : 0,
                    RatingAverage = document.ContainsKey("RatingAverage") ? Convert.ToDouble(document["RatingAverage"]) : 0,
                    RatingCount = document.ContainsKey("RatingCount") ? Convert.ToInt32(document["RatingCount"]) : 0,
                    MaxSaleQuantity = document.ContainsKey("MaxSaleQuantity") ? Convert.ToInt32(document["MaxSaleQuantity"]) : 0,
                    MinSaleQuantity = document.ContainsKey("MinSaleQuantity") ? Convert.ToInt32(document["MinSaleQuantity"]) : 0,
                    Quantity = document.ContainsKey("Quantity") ? Convert.ToInt32(document["Quantity"]) : 0,
                    AllTimeQuantitySold = document.ContainsKey("AllTimeQuantitySold") ? Convert.ToInt32(document["AllTimeQuantitySold"]) : 0,
                    ShortUrl = document.ContainsKey("ShortUrl") ? document["ShortUrl"].ToString() : "",
                    SellerID_NK = document.ContainsKey("SellerID_NK") ? Convert.ToInt32(document["SellerID_NK"]) : 0,
                    BrandID_NK = document.ContainsKey("BrandID_NK") ? Convert.ToInt32(document["BrandID_NK"]) : 0,
                    Category_LV0_NK = document.ContainsKey("Category_LV0_NK") ? Convert.ToInt32(document["Category_LV0_NK"]) : 0,
                    CreatedAt = DateTime.Parse(document.ContainsKey("CreatedAt") ? document["CreatedAt"].ToString() : "")
                };
                products.Add(product);
            }
            return products.ToList();
        }
        private List<SellerPriority> ConvertToSellerPriority(List<object> documents)
        {
            var sellerPriority = new List<SellerPriority>();
            foreach (dynamic document in documents)
            {
                var sellerPriority_temp = new SellerPriority
                {
                    AccID = document.ContainsKey("ACCOUNTID") ? Convert.ToInt32(document["ACCOUNTID"]) : 0,
                    SellerID = document.ContainsKey("SELLERID") ? Convert.ToInt32(document["SELLERID"]) : 0,
                    Idx = document.ContainsKey("IDX") ? Convert.ToInt32(document["IDX"]) : 0,
                };
                sellerPriority.Add(sellerPriority_temp);
            }
            return sellerPriority.ToList();
        }
        private List<Brand> ConvertToBrand(List<object> documents)
        {
            var brands = new List<Brand>();
            foreach (dynamic document in documents)
            {
                var brand = new Brand
                {
                    ID_NK = document.ContainsKey("ID_NK") ? Convert.ToInt32(document["ID_NK"]) : 0,
                    ID_SK = document.ContainsKey("ID_SK") ? Convert.ToInt32(document["ID_SK"]) : 0,
                    Name = document.ContainsKey("Name") ? document["Name"].ToString() : "",
                    Slug = document.ContainsKey("Slug") ? document["Slug"].ToString() : ""
                };
                brands.Add(brand);
            }
            return brands.ToList();
        }

        private List<DetailComment> ConvertToComment(List<object> documents)
        {
            var commments = new List<DetailComment>();
            foreach (dynamic document in documents)
            {
                var comment = new DetailComment
                {

                    ID = document.ContainsKey("ID") ? Convert.ToInt32(document["ID"]) : 0,
                    ID_SK = document.ContainsKey("ID_SK") ? Convert.ToInt32(document["ID_SK"]) : 0,
                    AccountID = document.ContainsKey("AccountID") ? Convert.ToInt32(document["AccountID"]) : 0,
                    SellerID = document.ContainsKey("SellerID") ? Convert.ToInt32(document["SellerID"]) : 0,
                    ProductID = document.ContainsKey("ProductID") ? Convert.ToInt32(document["ProductID"]) : 0,
                    Image = document.ContainsKey("Image") ? document["Image"].ToString() : "",
                    Rating = document.ContainsKey("Rating") ? Convert.ToInt32(document["Rating"]) : 0,
                    Content = document.ContainsKey("Content") ? document["Content"].ToString() : "",
                    TimelineContent = document.ContainsKey("TimelineContent") ? document["TimelineContent"].ToString() : "",
                    CreatedAt = DateTime.Parse(document.ContainsKey("CreatedAt") ? document["CreatedAt"].ToString() : "")
                };
                commments.Add(comment);
            }
            return commments.ToList();
        }

        //

        public async Task<(List<dynamic> Products, int TotalCount, List<Brand> brands, List<Category> categories)> ProductAfterTraining(ProductParameters productParameters)
        {
            var filters = new List<QueryContainer>();

            if (!string.IsNullOrEmpty(productParameters.ProductName))
            {
                filters.Add(new MatchPhraseQuery
                {
                    Field = "Name",
                    Query = productParameters.ProductName
                });
            }

            if (productParameters.CategoryIds.Any())
            {
                filters.Add(new TermsQuery
                {
                    Field = "Category_LV0_NK",
                    Terms = productParameters.CategoryIds.Select(id => (object)id)
                });
            }

            if (productParameters.BrandIds.Any())
            {
                filters.Add(new TermsQuery
                {
                    Field = "BrandID_NK",
                    Terms = productParameters.BrandIds.Select(id => (object)id)
                });
            }

            if (productParameters.MinPrice.HasValue || productParameters.MaxPrice.HasValue)
            {
                filters.Add(new NumericRangeQuery
                {
                    Field = "Price",
                    GreaterThanOrEqualTo = (double)productParameters.MinPrice,
                    LessThanOrEqualTo = (double)productParameters.MaxPrice
                });
            }

            if (productParameters.MinReviewRating.HasValue)
            {
                filters.Add(new NumericRangeQuery
                {
                    Field = "RatingAverage",
                    GreaterThanOrEqualTo = productParameters.MinReviewRating
                });
            }

            var countResponse = await _elasticClient.CountAsync<object>(s => s
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Must(mu => mu
                            .MatchAll()
                        )
                        .Filter(filters.ToArray())
                    )
                )
            );

            var count = Convert.ToInt32(countResponse.Count);

            var response = await _elasticClient.SearchAsync<object>(s => s
                .Index("shoprecommend")
                .Size(count)
                .Query(q => q
                    .Bool(b => b
                        .Must(mu => mu
                            .MatchAll()
                        )
                        .Filter(filters.ToArray())
                    )
                )
                .Aggregations(a => a
                    .ValueCount("total_products", vc => vc
                            .Field("ID_NK")
                    )
                )
            );

            var all_response = await _elasticClient.SearchAsync<object>(s => s
                    .Index("shoprecommend")
                    .Size(count)
                    .Query(q => q
                        .Bool(b => b
                            .Must(mu => mu
                                .MatchAll()
                            )
                            .Filter(filters.ToArray())
                        )
                    )
                );

            if (!response.IsValid || !all_response.IsValid)
            {
                return (null, 0, null, null);
            }


            var products = ConvertToProduct(response.Documents.ToList());
            var all_products = ConvertToProduct(all_response.Documents.ToList());

            var sellerIds = products.Select(p => p.SellerID_NK).ToList();
            var brandIds = all_products.Select(p => p.BrandID_NK).Distinct().ToList();
            var categoryIds = all_products.Select(p => p.Category_LV0_NK).Distinct().ToList();

            var priorityItems = await _elasticClient.SearchAsync<dynamic>(s => s
                .Index("accselpri")
                .Query(q => q
                    .Terms(t => t
                        .Field("SELLERID")
                        .Terms(sellerIds)
                    )
                )
                .Sort(ss => ss
                    .Field(f => f
                        .Field("IDX")
                        .Order(SortOrder.Ascending)
                    )
                )
                .Size(10000)
            );

            if (!priorityItems.IsValid)
            {
                return (null, 0, null, null);
            }


            var sellerPriority = ConvertToSellerPriority(priorityItems.Documents.ToList());

            var combinedResults = new List<dynamic>();

            foreach (var product in products)
            {
                var sellerId = product.SellerID_NK;
                var priority = sellerPriority.FirstOrDefault(p => p.SellerID == sellerId);

                if (priority != null)
                {
                    combinedResults.Add(new
                    {
                        Product = product,
                        IDX = priority.Idx
                    });
                }
                else
                {
                    combinedResults.Add(new
                    {
                        Product = product,
                        IDX = 0
                    });
                }
            }

            var sortedResults = combinedResults.OrderBy(r => r.IDX)
            .Skip(productParameters.PageNumber * productParameters.PageSize)
            .Take(productParameters.PageSize)
            .ToList();


            var brands = await _dbContext.Brands
                .Where(b => brandIds.Contains(b.ID_NK))
                .ToListAsync();

            var categories = await _dbContext.Category
                .Where(c => categoryIds.Contains(c.ID_NK))
                .ToListAsync();

            return (sortedResults, count, brands, categories);
        }

        public async Task<(List<Product> Products, int TotalCount, List<Brand> brands, List<Category> categories)> GetAllAsync(ProductParameters productParameters)
        {
            var filters = new List<QueryContainer>();

            if (!string.IsNullOrEmpty(productParameters.ProductName))
            {
                filters.Add(new MatchPhraseQuery
                {
                    Field = "Name",
                    Query = productParameters.ProductName
                });
            }

            if (productParameters.CategoryIds.Any())
            {
                filters.Add(new TermsQuery
                {
                    Field = "Category_LV0_NK",
                    Terms = productParameters.CategoryIds.Select(id => (object)id)
                });
            }

            if (productParameters.BrandIds.Any())
            {
                filters.Add(new TermsQuery
                {
                    Field = "BrandID_NK",
                    Terms = productParameters.BrandIds.Select(id => (object)id)
                });
            }

            if (productParameters.MinPrice.HasValue || productParameters.MaxPrice.HasValue)
            {
                filters.Add(new NumericRangeQuery
                {
                    Field = "Price",
                    GreaterThanOrEqualTo = (double)productParameters.MinPrice,
                    LessThanOrEqualTo = (double)productParameters.MaxPrice
                });
            }

            if (productParameters.MinReviewRating.HasValue)
            {
                filters.Add(new NumericRangeQuery
                {
                    Field = "RatingAverage",
                    GreaterThanOrEqualTo = productParameters.MinReviewRating
                });
            }

            var response = await _elasticClient.SearchAsync<object>(s => s
                .Index("shoprecommend")
                .From(productParameters.PageNumber * productParameters.PageSize)
                .Size(productParameters.PageSize)
                .Query(q => q
                    .Bool(b => b
                        .Must(mu => mu
                            .MatchAll()
                        )
                        .Filter(filters.ToArray())
                    )
                )
                .Aggregations(a => a
                    .ValueCount("total_products", vc => vc
                            .Field("ID_NK")
                    )
                )
                .Sort(ss => ss
                    .Script(sc => sc
                        .Type("number")
                        .Script(script => script
                            .Source("doc['BrandID_NK'].value == 0 ? 1 : 0")
                        )
                        .Order(SortOrder.Ascending)
                    )
                    .Field(f => f
                        .Field("RatingCount")
                        .Order(SortOrder.Descending)
                    )
                )
            );

            var totalProducts = Convert.ToInt32(response.Aggregations.ValueCount("total_products").Value);

            var all_response = await _elasticClient.SearchAsync<object>(s => s
                    .Index("shoprecommend")
                    .Size(totalProducts)
                    .Query(q => q
                        .Bool(b => b
                            .Must(mu => mu
                                .MatchAll()
                            )
                            .Filter(filters.ToArray())
                        )
                    )
                );

            if (!response.IsValid || !all_response.IsValid)
            {
                return (null, 0, null, null);
            }

            var products = ConvertToProduct(response.Documents.ToList());
            var products_infor = ConvertToProduct(all_response.Documents.ToList());

            var brandIds = products_infor.Select(p => p.BrandID_NK).Distinct().ToList();
            var categoryIds = products_infor.Select(p => p.Category_LV0_NK).Distinct().ToList();

            var brands = await _dbContext.Brands
               .Where(b => brandIds.Contains(b.ID_NK))
               .ToListAsync();

            var categories = await _dbContext.Category
                .Where(c => categoryIds.Contains(c.ID_NK))
                .ToListAsync();



            return (products, totalProducts, brands, categories);
        }


        public async Task<IEnumerable<Product>> GetByIdAsync(int id)
        {
            var response = await _elasticClient.SearchAsync<object>(s => s
                    .Index("shoprecommend")
                    .From(0)
                    .Size(10)
                    .Query(q => q
                        .Match(m => m
                        .Field("ID_NK")
                        .Query(id.ToString())
                )
                    )
                );
            if (!response.IsValid)
            {
                return Enumerable.Empty<Product>();
            }

            var documents = ConvertToProduct(response.Documents.ToList());
            return documents;
        }

        public class ProductRatingCountDTO
        {
            public long RatingLessThan1 { get; set; }
            public long Rating1To2 { get; set; }
            public long Rating2To3 { get; set; }
            public long Rating3To4 { get; set; }
            public long Rating4To5 { get; set; }
        }

        public async Task<ProductRatingCountDTO> ProductRatingCount()
        {
            var countResponse1 = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Range(r => r.Field("RatingAverage").LessThanOrEquals(1))
                        )
                    )
                )
            );

            var countResponse2 = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Range(r => r.Field("RatingAverage").LessThanOrEquals(2).GreaterThan(1))
                        )
                    )
                )
            );

            var countResponse3 = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Range(r => r.Field("RatingAverage").LessThanOrEquals(3).GreaterThan(2))
                        )
                    )
                )
            );

            var countResponse4 = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Range(r => r.Field("RatingAverage").LessThanOrEquals(4).GreaterThan(3))
                        )
                    )
                )
            );

            var countResponse5 = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Range(r => r.Field("RatingAverage").LessThanOrEquals(5).GreaterThan(4))
                        )
                    )
                )
            );

            return new ProductRatingCountDTO
            {
                RatingLessThan1 = countResponse1.Count,
                Rating1To2 = countResponse2.Count,
                Rating2To3 = countResponse3.Count,
                Rating3To4 = countResponse4.Count,
                Rating4To5 = countResponse5.Count
            };
        }

        //Brands
        private async Task<int> GetTotalProductCountForBrand(int brandId)
        {
            var response = await _elasticClient.SearchAsync<object>(s => s
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("BrandID_NK").Value(brandId))
                        )
                    )
                )
            );

            if (!response.IsValid)
            {
                return 0;
            }

            return Convert.ToInt32(response.Total);
        }
        public async Task<List<BrandDetailDTO>> GetBrands()
        {

            var searchResponse = await _elasticClient.SearchAsync<dynamic>(s => s
                .Index("shoprecommend")
                .Size(0)
                .Aggregations(a => a
                    .Terms("brands", t => t
                        .Field("BrandID_NK")
                        .Size(15)
                        .Order(o => o
                            .Descending("product_count")
                      )
                        .Aggregations(aa => aa
                            .ValueCount("product_count", v => v.Field("BrandID_NK"))
                        )
                    )
                )
            );

            if (!searchResponse.IsValid)
            {

                return new List<BrandDetailDTO>();
            }

            var brandBuckets = searchResponse.Aggregations.Terms("brands").Buckets;
            var topBrandIds = brandBuckets.Select(b => int.Parse(b.Key)).ToList();


            var brands = await _dbContext.Brands
                .Where(b => topBrandIds.Contains(b.ID_NK))
                .ToListAsync();



            if (brands.Count() < 0)
            {

                return new List<BrandDetailDTO>();
            }


            var brandsResponse = new List<BrandDetailDTO>();

            foreach (var brand in brands)
            {
                var totalProduct = (int)brandBuckets.First(b => int.Parse(b.Key) == brand.ID_NK).ValueCount("product_count").Value;

                var brandDetailDTO = new BrandDetailDTO
                {
                    Brand = brand,
                    TotalProduct = totalProduct
                };

                brandsResponse.Add(brandDetailDTO);
            }

            var sortedList = brandsResponse
                .OrderByDescending(c => c.TotalProduct)
                .ToList();

            return sortedList;
        }
        //Comments
        public async Task<List<DetailCommentDTO>> DetailComments(CommentParameters commentParameters, int ProductId)
        {
            var response = await _elasticClient.SearchAsync<object>(s => s
               .Index("comments")
               .Query(q => q
                   .Bool(b => b
                       .Filter(filters => filters
                           .Term(t => t.Field("ProductID").Value(ProductId))
                       )
                   )
               )
               .From(commentParameters.PageNumber * commentParameters.PageSize)
               .Size(commentParameters.PageSize)
            );

            if (!response.IsValid)
            {
                return new List<DetailCommentDTO>();
            }

            List<CommentDTO> detailComments = _mapper.Map<List<CommentDTO>>(ConvertToComment(response.Documents.ToList()));

            foreach (var commentDTO in detailComments)
            {
                var account = _mapper.Map<AccountDTO>(await _dbContext.Accounts.FirstOrDefaultAsync(a => a.ID_NK == commentDTO.AccountID));
                commentDTO.Account = account;
            }

            DetailCommentDTO comments = new DetailCommentDTO
            {
                DetailComment = detailComments,
                Total = (int)response.Total
            };

            return new List<DetailCommentDTO> { comments };
        }

        public class CommentsRatingCountDTO
        {
            public long RatingLessThanOrEqual1 { get; set; }
            public long Rating1To2 { get; set; }
            public long Rating2To3 { get; set; }
            public long Rating3To4 { get; set; }
            public long Rating4To5 { get; set; }
        }

        public async Task<CommentsRatingCountDTO> CommentsRatingCount(int idProduct)
        {
            var countResponse1 = await _elasticClient.CountAsync<object>(c => c
                .Index("comments")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("ProductID").Value(idProduct)) &&
                            filters.Range(r => r.Field("Rating").LessThanOrEquals(1))
                        )
                    )
                )
            );

            var countResponse2 = await _elasticClient.CountAsync<object>(c => c
                .Index("comments")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("ProductID").Value(idProduct)) &&
                            filters.Range(r => r.Field("Rating").LessThanOrEquals(2).GreaterThan(1))
                        )
                    )
                )
            );

            var countResponse3 = await _elasticClient.CountAsync<object>(c => c
                .Index("comments")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("ProductID").Value(idProduct)) &&
                            filters.Range(r => r.Field("Rating").LessThanOrEquals(3).GreaterThan(2))
                        )
                    )
                )
            );

            var countResponse4 = await _elasticClient.CountAsync<object>(c => c
                .Index("comments")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("ProductID").Value(idProduct)) &&
                            filters.Range(r => r.Field("Rating").LessThanOrEquals(4).GreaterThan(3))
                        )
                    )
                )
            );

            var countResponse5 = await _elasticClient.CountAsync<object>(c => c
                .Index("comments")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("ProductID").Value(idProduct)) &&
                            filters.Range(r => r.Field("Rating").LessThanOrEquals(5).GreaterThan(4))
                        )
                    )
                )
            );

            return new CommentsRatingCountDTO
            {
                RatingLessThanOrEqual1 = countResponse1.Count,
                Rating1To2 = countResponse2.Count,
                Rating2To3 = countResponse3.Count,
                Rating3To4 = countResponse4.Count,
                Rating4To5 = countResponse5.Count
            };
        }
        //Seller
        public async Task<SellerDTO> GetLastestProductsOfSellerById(SellerParameters sellerParameters, int id)
        {
            var res = await _dbContext.Sellers.FindAsync(id);
            if (res == null)
            {
                return null;
            }

            var seller = _mapper.Map<SellerDTO>(res);

            var countResponse = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("SellerID_NK").Value(id))
                        )
                    )
                )
            );

            if (countResponse.IsValid)
            {
                seller.Total = Convert.ToInt32(countResponse.Count);
            }
            else
            {
                seller.Total = 0;
            }

            var searchResponse = await _elasticClient.SearchAsync<object>(s => s
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("SellerID_NK").Value(id))
                        )
                    )
                )
                .From(sellerParameters.PageNumber * sellerParameters.PageSize)
                .Size(sellerParameters.PageSize)
            );

            var listProductDetail = new List<ProductDetailDTO>();

            if (searchResponse.IsValid && searchResponse.Documents.Any())
            {
                var latestProduct = ConvertToProduct(searchResponse.Documents.ToList());
                var latestProducts = latestProduct.OrderByDescending(p => p.CreatedAt);
                foreach (var item in latestProduct)
                {
                    var productDetail = new ProductDetailDTO();
                    var images = await _dbContext.Images.Where(i => i.ProductID_NK == item.ID_NK).ToListAsync();

                    productDetail.Product = _mapper.Map<ProductDTO>(item);
                    productDetail.Images = _mapper.Map<List<ImageDTO>>(images);

                    listProductDetail.Add(productDetail);
                }

                seller.Products = listProductDetail;
            }
            else
            {
                seller.Products = null;
            }

            return seller;
        }
        public async Task<SellerDTO> GetTopQuantitySoldProductsOfSellerById(SellerParameters sellerParameters, int id)
        {
            var res = await _dbContext.Sellers.FindAsync(id);
            if (res == null)
            {
                return null;
            }

            var seller = _mapper.Map<SellerDTO>(res);

            var countResponse = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("SellerID_NK").Value(id))
                        )
                    )
                )
            );

            if (countResponse.IsValid)
            {
                seller.Total = Convert.ToInt32(countResponse.Count);
            }
            else
            {
                seller.Total = 0;
            }

            var searchResponse = await _elasticClient.SearchAsync<object>(s => s
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("SellerID_NK").Value(id))
                        )
                    )
                )
                .From(sellerParameters.PageNumber * sellerParameters.PageSize)
                .Size(sellerParameters.PageSize)
            );
            var listProductDetail = new List<ProductDetailDTO>();
            if (searchResponse.IsValid && searchResponse.Documents.Any())
            {
                var latestProduct = ConvertToProduct(searchResponse.Documents.ToList());
                var latestProducts = latestProduct.OrderByDescending(p => p.AllTimeQuantitySold);

                foreach (var item in latestProducts)
                {
                    var productDetail = new ProductDetailDTO();
                    var images = await _dbContext.Images.Where(i => i.Product.ID_NK == item.ID_NK).ToListAsync();

                    productDetail.Product = _mapper.Map<ProductDTO>(item);
                    productDetail.Images = _mapper.Map<List<ImageDTO>>(images);

                    listProductDetail.Add(productDetail);
                }

                seller.Products = listProductDetail;
            }
            else
            {
                seller.Products = null;
            }

            return seller;
        }
        public async Task<List<Product>> GetProductByCate(int cateId)
        {
            var countResponse = await _elasticClient.SearchAsync<object>(c => c
                .Index("shoprecommend")
                .Size(10)
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(p => p.Field("Category_LV0_NK").Value(cateId))
                        )
                    )
                )
                .Sort(ss => ss
                    .Field(f => f
                        .Field("RatingCount")
                        .Order(SortOrder.Descending)
                    )
                    .Field(f => f
                        .Field("RatingAverage")
                        .Order(SortOrder.Descending)
                    )
                )
            );
            return new List<Product>();
        }
        public async Task<SellerDTO> GetProductsBySeller(SellerParameters sellerParameters, int id)
        {
            var res = await _dbContext.Sellers.FindAsync(id);
            if (res == null)
            {
                return null;
            }

            var seller = _mapper.Map<SellerDTO>(res);

            var countResponse = await _elasticClient.CountAsync<object>(c => c
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("SellerID_NK").Value(id))
                        )
                    )
                )
            );

            if (countResponse.IsValid)
            {
                seller.Total = Convert.ToInt32(countResponse.Count);
            }
            else
            {
                seller.Total = 0;
            }

            var searchResponse = await _elasticClient.SearchAsync<object>(s => s
                .Index("shoprecommend")
                .Query(q => q
                    .Bool(b => b
                        .Filter(filters => filters
                            .Term(t => t.Field("SellerID_NK").Value(id))
                        )
                    )
                )
                .From(sellerParameters.PageNumber * sellerParameters.PageSize)
                .Size(sellerParameters.PageSize)
            );

            var listProductDetail = new List<ProductDetailDTO>();

            if (searchResponse.IsValid && searchResponse.Documents.Any())
            {
                var latestProduct = ConvertToProduct(searchResponse.Documents.ToList());
                foreach (var item in latestProduct)
                {
                    var productDetail = new ProductDetailDTO();
                    var images = await _dbContext.Images.Where(i => i.Product.ID_NK == item.ID_NK).ToListAsync();

                    productDetail.Product = _mapper.Map<ProductDTO>(item);
                    productDetail.Images = _mapper.Map<List<ImageDTO>>(images);

                    listProductDetail.Add(productDetail);
                }

                seller.Products = listProductDetail;
            }
            else
            {
                seller.Products = null;
            }

            return seller;
        }

    }
}
