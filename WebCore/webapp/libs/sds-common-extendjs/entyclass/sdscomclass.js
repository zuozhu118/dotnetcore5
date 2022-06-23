/*机构人员类*/
class siteperson{
    id;
    siteID;
    position;
    otherPosition;
    name;
    sex;
    telePhone;
    email;
    personalDetails;
    sourceComment;
    updatedTime;
    updatedBy;
}
/*用户关注类*/
class Src_UserAttention{
    Id;
    UserId;
    TenantId;
    TenantType;
    status;
    CreatedBy;
    CreatedTime;
}

/*添加纠错类*/
class AddCorrectionInput{
    siteId;
    correctionContent;
    integral;
    field;
    fieldText;
    fieldType;
    pkid;
    tableName;
    originalValue;  //原始内容
}

/*机构、伦理、遗传办修改类*/
class OrgClaimUpdateInput{
    siteOrgId;
    pkid;
    tableName;
    field;
    fieldType;
    oldValue;
    newValue;
}

/*机构人员类*/
class NewECPerson{
    id;
    ecID;
    position;
    otherPosition;
    name;
    sex;
    telePhone;
    email;
    personalDetails;
    sourceComment;
    updatedTime;
    updatedBy;
}