SELECT rp.RETAIL_POINT_ID, rp.TITLE FROM RETAIL_POINTS rp, PAYMASTER_TOKEN pt
    WHERE rp.RETAIL_POINT_ID = pt.RETAIL_POINT_ID AND pt.IS_DELETE = 0 AND pt.PHONE = 'phone'