type Product = {
    promotion_id: string; // 促销活动ID
    product_id: string; // 商品ID
    title: string; // 商品标题
    cover: {
        // 商品封面图
        uri: string; // 图片地址
        url_list: string[]; // 图片地址列表
    };
    detail_url: string; // 商品详情页地址
    promotion_source: number; // 促销活动来源
    brand_icon: {
        // 品牌图标
        url_list: string[]; // 图片地址列表
    };
    price: number; // 商品价格
    market_price: number; // 商品市场价格
    cos_fee: number; // 商品佣金
    cos_radio: number; // 商品佣金比例
    month_sales: number; // 商品月销量
    shop_id: number; // 店铺ID
    shop_name: string; // 店铺名称
    exp_source: string; // 体验来源
    in_promotion: boolean; // 是否在促销活动中
    in_shop: boolean; // 是否在店铺中
    sales: number; // 商品销量
    market_cos_ratio: number; // 商品市场佣金比例
    is_product_distribution: boolean; // 是否是分销商品
    cos_ratio_type: number; // 佣金比例类型
    privilege_info: {
        // 商品优惠信息
        privilege_type: number; // 优惠类型
        privilege_info_detail: any; // 优惠信息详情
    };
    douyin_goods_info: {
        // 抖音商品信息
        tag_id: number; // 标签ID
    };
    no_worry_info: {
        // 无忧信息
        tag_id: number; // 标签ID
    };
    tag_list: {
        // 商品标签列表
        type: number; // 标签类型
        title: string; // 标签标题
    }[];
    pic_product_tag: {
        // 商品图片标签
        type: string; // 标签类型
        pic: string; // 标签图片
    }[];
    text_product_tag: {
        // 商品文本标签
        type: string; // 标签类型
        text: {
            // 标签文本
            text: string;
        };
        border_color: string; // 标签边框颜色
    }[];
    has_same_type: boolean; // 是否有同类型商品
};

type ProductAjaxResult = {
    code: number; // 状态码
    st: number; // 时间戳
    msg: string; // 消息
    data: {
        promotions: Product[]; // 商品列表
        has_more: boolean; // 是否有更多
        search_id: string; // 搜索ID
        rec_has_more: boolean; // 是否有更多推荐
        session_id: string; // 会话ID
    };
    total: number; // 总数
    log_id: string; // 日志ID
    rec_total: number; // 推荐总数
};
